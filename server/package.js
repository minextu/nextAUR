const error = require('./error.js');
const rp = require('request-promise');
const to = require('await-to-js').default;
const Database = require('./database');
const Docker = require('./docker');
const Repo = require('./repo');
const fs = require('fs');
const tar = require('tar-fs');
const exec = require('child_process').exec;
const glob = require("glob");
const temp = require("temp").track();

const aurApiUrl = "https://aur.archlinux.org/rpc/";
const pacmanApiUrl = "https://www.archlinux.org/packages/search/json/";

let err;

class Package {
  constructor() {
    this.database = new Database();
  }

  getRemoteId() {
    return this.remoteId;
  }

  getName() {
    return this.name;
  }

  getId() {
    return this.id;
  }

  getDescription() {
    return this.description;
  }

  getVersion() {
    return this.version;
  }

  getDownloadUrl() {
    return this.downloadUrl;
  }

  getDepends() {
    return this.depends;
  }

  getMakeDepends() {
    return this.makeDepends;
  }

  async setRepo(repoId) {
    this.repo = new Repo();
    [err] = await to(this.repo.loadId(repoId));
    if (err) { throw err; }

    this.repoId = repoId;
  }

  /**
   * Load PKG from database by name and repo id
   * @param  {String} name    Package name
   * @param  {String} repoId  Repo id
   * @return {Promise}
   */
  async loadName(name, repoId) {
    // get package info
    let packages;
    [err, packages] = await to(this.database.query(`
      SELECT * from packages WHERE name = ? AND repoId = ?
    `, [name, repoId]));
    if (err) { console.error(err); }
    if (packages[0].length === 0) {
      throw new error.NotFound(`pkg '${name}' not found in repo id ${repoId}`);
    }

    // get package depends
    let depends;
    [err, depends] = await to(this.database.query(`
      SELECT * from depends WHERE packageId = ?
    `, [packages[0][0].id]));
    if (err) { console.error(err); }

    // set info
    let info = packages[0][0];
    await this._setInfo(info, depends);
  }

  /**
   * Load PKG from database by id
   * @param  {Number} id Package id
   * @return {Promise}
   */
  async loadId(id) {
    // get package info
    let packages;
    [err, packages] = await to(this.database.query(`
      SELECT * from packages WHERE id = ?
    `, [id]));
    if (err) { console.error(err); }
    if (packages[0].length === 0) {
      throw new error.NotFound(`pkg with id '${id}' not found in database`);
    }

    // get package depends
    let depends;
    [err, depends] = await to(this.database.query(`
      SELECT * from depends WHERE packageId = ?
    `, [packages[0][0].id]));
    if (err) { console.error(err); }

    // set info
    let info = packages[0][0];
    await this._setInfo(info, depends);
  }

  async _setInfo(info, depends) {
    this.remoteId = info.remoteId;
    this.id = info.id;
    this.name = info.name;
    this.description = info.description;
    this.version = info.version;
    this.downloadUrl = info.downloadUrl;
    this.status = info.status;
    this.containerId = info.containerId;
    await this.setRepo(info.repoId);

    // set depends and makedepends
    this.depends = [];
    this.makeDepends = [];
    if (depends[0].length === 0) {
      return;
    }

    // loop through all dependencies
    for (let id in depends[0]) {
      let depend = depends[0][id];
      if (depend.type === 0) {
        this.depends[this.depends.length] = depend.name;
      }
      else {
        this.makeDepends[this.makeDepends.length] = depend.name;
      }
    }
  }

  /**
   * Fetch PKG from aur by name
   * @param  {String} name Package name
   * @return {Promise}
   */
  async fetchName(name) {
    // set request options
    let options = {
      uri: aurApiUrl,
      qs: {
        v: 5, type: "info", arg: [name]
      }, json: true
    };

    return rp(options).then(res => {
      // fail if more or less than 1 result was found
      if (res.resultcount !== 1) {
        throw new error.NotFound(`pkg '${name}' not found`);
      }
      return res;
    }).then(async res => {
      // set info
      let info = res.results[0];
      this.remoteId = info.ID;
      this.name = info.Name;
      this.description = info.Description;
      this.version = info.Version;
      this.downloadUrl = info.URLPath;
      this.depends = info.Depends ? info.Depends : [];
      this.makeDepends = info.MakeDepends ? info.MakeDepends : [];

      return this;
    });
  }

  /**
   * Get all available packages in repo
   * @param {Number} repo Repo id to get packages for
   * @return {Promise} A list of Repo objects on resolve
   */
  async getAll(repo) {
    let pkgList = [];

    // get repo info
    let pkgs;
    [err, pkgs] = await to(this.database.query(`
      SELECT id from packages WHERE repoId = ?
    `, [repo]));
    if (err) { console.error(err); }

    for (let index in pkgs[0]) {
      let id = pkgs[0][index].id;
      let pkg = new Package();

      [err] = await to(pkg.loadId(id));
      if (err) { throw err; }

      pkgList[pkgList.length] = pkg;
    }

    return pkgList;
  }

  /**
   * Save fetched Package to Database
   * @return {Promise}
   */
  async save() {
    if (this.name === undefined) {
      throw new Error("Package has to fetched first");
    }
    if (this.repoId === undefined) {
      throw new Error("setRepo(repoId) has to called first");
    }

    // check if package does already exist in database
    let testPkg = new Package();
    [err] = await to(testPkg.loadName(this.name, this.repoId));
    if (!err) {
      throw new error.Exists(`Package '${this.name}' does already exit in repo id ${this.repoId}`);
    }
    else if (err && err.name !== "NotFound") {
      throw (err);
    }

    // save package to database
    let result = await this.database.query(`
      INSERT INTO packages (remoteId, name, description, version, downloadUrl, repoId)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [this.remoteId, this.name, this.description, this.version, this.downloadUrl, this.repoId]);
    // save depends
    [err] = await to(this._saveDependencies(this.depends, result[0].insertId, 0));
    if (err) { throw err; }
    [err] = await to(this._saveDependencies(this.makeDepends, result[0].insertId, 1));
    if (err) { throw err; }
  }

  /**
   * Check for all prerequisites and build the package
   * @return {Promise}  Resolve is called before doker is finished
   */
  async build() {
    if (this.name === undefined) {
      throw new Error("Package has to fetched first!");
    }
    if (this.status === "building") {
      throw new Error("Package is already being build");
    }

    // check if all dependencies exist (recursive)
    let dependencies = await this.checkPackages(this.depends.concat(this.makeDepends), true, true);

    // create a list of of all aur dependencies packages
    // TODO: unclutter
    let aurDependencies = [];
    for (let index in dependencies.packages) {
      let depend = dependencies.packages[index];

      if (depend && depend.source === "aur") {
        [err] = await to(new Promise((resolve, reject) => {
          glob(`${this.repo.getPath()}/${depend.name}*.pkg.tar.xz`, {}, function (err, files) {
            if (err) { reject(err); }

            if (files.length === 0) {
              reject((new Error(`No package file for ${depend.name} found`)));
              return;
            }

            // get the last found package (newest version)
            aurDependencies[aurDependencies.length] = files[files.length - 1].replace(/.*\//, '');
            resolve();
          });
        }));
        if (err) { throw err; }
      }
    }

    // create a tarball out of all aur dependencies
    let dependencyStream = tar.pack(this.repo.getPath(), {
      entries: aurDependencies
    });

    await this._buildDocker(dependencyStream);
  }

  async getLogs() {
    if (this.id === undefined) { throw new Error("Package has to be loaded first"); }

    // get live logs
    if (this.containerId) {
      let docker = new Docker();
      docker.setContainer(this.containerId);

      let stream = await docker.container.logs({
        stream: true,
        follow: true,
        stdout: true,
        stderr: true
      });

      return stream;
    }
    // get log file
    else {
      let rs = fs.createReadStream(`${this.repo.getPath()}/${this.name}-build.log`);
      return rs;
    }
  }

  /**
   * Checks if all given packages are available
   * @param  {Array}   packages    Array of packages to check
   * @param  {Boolean} throwError Throw an error, when dependency is not available
   * @param  {Boolean} recursive  Recursivly check all dependencies
   * @return {Promise}
   */
  async checkPackages(packages, throwError = false, recursive = false, all = []) {
    let status = {
      packages: [],
      allAvailable: true
    };
    let dependencies = [];

    // stop, if no packages were given
    if (packages.length === 0) { return status; }

    for (let index in packages) {
      if (!packages[index]) { break; }

      // TODO: check version number
      let pkg = packages[index].replace(/>.*/, '').replace(/<.*/, '').replace(/=.*/, '');

      // skip, if this packages has already been added previously
      if (all.indexOf(pkg) !== -1) { continue; }

      // check if this is an aur package and it is in our database
      // TODO: check build status
      let testPkg = new Package();
      [err] = await to(testPkg.loadName(pkg, this.repoId));
      if (err && err.name !== "NotFound") { throw err; }
      else if (!err) {
        all[all.length] = pkg;
        status.packages[status.packages.length] = { name: pkg, available: true, source: "aur" };

        // add dependencies to dependency list, used for recursive checks
        dependencies = dependencies.concat(testPkg.getDepends().concat(testPkg.getMakeDepends()));

        continue;
      }

      // check if this is a pacman package
      let options = {
        uri: pacmanApiUrl,
        qs: {
          name: pkg
        }, json: true
      };

      let res = await rp(options);
      if (res.results.length > 0) {
        status.packages[status.packages.length] = { name: pkg, available: true, source: "pacman" };
      }
      // package is not available
      else {
        status.packages[status.packages.length] = { name: pkg, available: false, source: "none" };
        status.allAvailable = false;
      }
    }

    if (throwError && !status.allAvailable) {
      // get all packages that are not available
      let notAvailable = [];
      for (let index in status.packages) {
        let pkg = status.packages[index];
        if (!pkg.available) { notAvailable[notAvailable.length] = pkg.name; }
      }

      throw new error.Dependency(`Not all dependencies are available (${notAvailable.join()})`);
    }

    if (recursive) {
      // remove duplicates
      dependencies = dependencies.filter((item, pos) => { return dependencies.indexOf(item) === pos; });

      let statusRecursive = await this.checkPackages(dependencies, throwError, dependencies, all);
      status.packages = status.packages.concat(statusRecursive.packages);
      status.allAvailable = statusRecursive.allAvailable && status.allAvailable;
    }

    return status;
  }

  /**
   * Save dependencies to database
   * @param  {Array}  depends   Array of dependencies
   * @param  {Number}  packageId Id of package
   * @param  {Number}  type      0 for depends, 1 for makedepns
   * @return {Promise}
   */
  async _saveDependencies(depends, packageId, type) {
    for (let depend of depends) {
      await this.database.query(`
  			INSERT INTO depends (name, packageId, type)
  				VALUES (?, ?, ?)
  			`, [depend, packageId, type]);
    }
  }

  /**
   * Builds a package using docker and runs _extractPackage() afterwards
   * @param {Stream} dependencyStream  A tar stream containing all dependencies
   * @return {Promise}
   */
  async _buildDocker(dependencyStream) {
    // set buildscript
    let buildScript = `
      # update system
      pacman -Syu --noconfirm --noprogressbar
      pacman -S wget --noconfirm --noprogressbar

      # add depend repo
      cd /srv/http
      if [ "$(ls -A .)" ]; then
        repo-add depends.db.tar.xz *
        echo -e "[depends]\nSigLevel=Never\nServer=file:///srv/http" >> /etc/pacman.conf
      fi

      # install depends and make depends
      pacman -Sy --noconfirm --needed --noprogressbar \
        ${this.depends.join(' ')} ${this.makeDepends.join(' ')}

      # run the build script as unprivileged user
      useradd -m build
      su build -s /bin/bash -c "
        mkdir ~/out                                           &&\
        cd ~/                                                 &&\
        wget https://aur.archlinux.org${this.downloadUrl}     &&\
        tar -xvf '${this.name}.tar.gz' && cd '${this.name}'   &&\
        makepkg                                               &&\
        cp *.pkg.tar.xz ~/out/
      "`;

    let docker = new Docker();
    try {
      // create container
      await docker.create(buildScript);

      // copy dependencies
      await docker.copyDependencies(dependencyStream);

      // run container
      await docker.start();
      console.log('container started');
      this._setStatus("building");
      this._setContainerId(docker.container.id);

      // save build log to file
      let writeStream = fs.createWriteStream(`${this.repo.getPath()}/${this.name}-build.log`);
      let stream = await docker.container.attach({ stream: true, stdout: true, stderr: true });
      stream.pipe(writeStream);

      this._dockerCleanup(docker);
    }
    catch (err) {
      this._setStatus("error");
      console.error(err);
    }
  }

  async _dockerCleanup(docker) {
    try {
    // wait for container to finish
      await docker.container.wait();

      // copy created package
      let stream = await docker.container.getArchive({ path: `/home/build/out/.` });
      let archive = await new Promise((resolve, reject) => {
        temp.open(`nextaur_${this.name}`, async (err, info) => {
          if (err) {
            reject(err);
          }

          let wstream = fs.createWriteStream(info.path);
          stream.pipe(wstream);
          wstream.on('finish', () => {
            return resolve(info.path);
          });
        });
      });

      let data = await docker.container.inspect();
      console.log(`Exit code: ${data.State.ExitCode}`);

      if (data.State.ExitCode !== 0) { throw new Error(`Container exited with code ${data.State.ExitCode}`); }

      // extract package file
      this._extractPackage(archive);

      this._setStatus("done");
    }
    catch (err) {
      this._setStatus("error");
      console.error(err);
    }

    // remove container after 5 seconds
    await new Promise(resolve => setTimeout(resolve, 5000));
    await docker.container.remove();
    console.log('container removed');
    this._setContainerId(null);
  }

  /**
   * Extracts a package created by build and calls _addToRepo() for all packages
   * @param  {String} packageArchive Path to package
   */
  _extractPackage(packageArchive) {
    // copy packages to repo
    fs
      .createReadStream(packageArchive)
      .pipe(
        tar.extract(this.repo.getPath(), {
          map: header => {
            if (header.name !== "./") {
              this._addToRepo(header.name);
            }
            return header;
          }
        })
      );
  }

  /**
   * Adds or updates a package on repo
   * @param  {String}  file Filename of the package
   * @return {Promise}
   */
  async _addToRepo(file) {
    // run repo-add to update repo database
    exec(`
      cd "${this.repo.getPath()}"
      ${__dirname}/../utils/repo-add -R ${this.repo.getName()}.db.tar.xz ${file}
    `, (error, stdout, stderr) => {
      if (error) { console.error(error); }
      if (stderr) { console.error(stderr); }
      if (stdout) { console.log(stdout); }
    });
  }

  async _setStatus(status) {
    if (this.id === undefined) { throw new Error("Package has to be loaded first"); }

    return this.database.query(`
      UPDATE packages SET status = ?
        WHERE id = ?
      `, [status, this.id]);
  }

  async _setContainerId(containerId) {
    if (this.id === undefined) { throw new Error("Package has to be loaded first"); }

    return this.database.query(`
      UPDATE packages SET containerId = ?
        WHERE id = ?
      `, [containerId, this.id]);
  }

  toArray() {
    if (this.id === undefined) { throw new Error("Package has to be loaded first"); }

    return {
      id: this.id,
      remoteId: this.remoteId,
      name: this.name,
      description: this.description,
      version: this.version,
      status: this.status,
      repoId: this.repoId,
      depends: this.depends,
      makeDepends: this.makeDepends,
    };
  }
}
module.exports = Package;
