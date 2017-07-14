const error = require('./error.js');
const rp = require('request-promise');
const to = require('await-to-js').default;
const Database = require('./database');
const Docker = require('dockerode');
const fs = require('fs');
const tar = require('tar-fs');
const exec = require('child_process').exec;
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

  /**
   * Load PKG from database by name
   * @param  {String} name Package name
   * @return {Promise}
   */
  async loadName(name) {
    // get package info
    let packages;
    [err, packages] = await to(this.database.query(`
      SELECT * from packages WHERE name = ?
    `, [name]));
    if (err) { console.error(err); }
    if (packages[0].length === 0) {
      throw new error.NotFound(`pkg '${name}' not found in database`);
    }

    // get package depends
    let depends;
    [err, depends] = await to(this.database.query(`
      SELECT * from depends WHERE packageId = ?
    `, [packages[0][0].id]));
    if (err) { console.error(err); }

    // set info
    let info = packages[0][0];
    this.remoteId = info.remoteId;
    this.id = info.id;
    this.name = info.name;
    this.description = info.description;
    this.version = info.version;
    this.downloadUrl = info.downloadUrl;

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
    }).then(res => {
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
   * Save fetched Package to Database
   * @return {Promise}
   */
  async save() {
    if (this.name === undefined) {
      throw new Error("Package has to fetched first!");
    }

    // check if package does already exist in database
    let testPkg = new Package();
    [err] = await to(testPkg.loadName(this.name));
    if (!err) {
      throw new error.Exists(`Package '${this.name}' does already exit in Database`);
    }
    else if (err && err.name != "NotFound") {
      throw (err);
    }

    // save package to database
    let result = await this.database.query(`
      INSERT INTO packages (remoteId, name, description, version, downloadUrl)
      VALUES (?, ?, ?, ?, ?)
    `, [this.remoteId, this.name, this.description, this.version, this.downloadUrl]);
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

    // check if all dependencies exist
    let status = await this.checkDependencies(this.depends.concat(this.makeDepends));
    if (!status.allAvailable) {
      // get all packages that are not available
      let notAvailable = [];
      for (let index in status.packages) {
        let depend = status.packages[index];
        if (!depend.available) { notAvailable[notAvailable.length] = depend.name; }
      }

      throw new error.Dependency(`Not all dependencies are available (${notAvailable.join()})`);
    }

    this._buildDocker();
  }

  /**
   * Checks if all given dependencies are available
   * @param  {Array}  depends Array of dependencies
   * @return {Promise}
   */
  async checkDependencies(depends) {
    let status = {
      packages: [],
      allAvailable: true
    };

    for (let index in depends) {
      // TODO: check version number
      let depend = depends[index].replace(/>.*/, '').replace(/<.*/, '').replace(/=.*/, '');

      // check if this is an aur package and it is in our database
      // TODO: check build status
      let testPkg = new Package();
      [err] = await to(testPkg.loadName(depend));
      if (err && err.name !== "NotFound") { throw err; }
      else if (!err) {
        status.packages[status.packages.length] = { name: depend, available: true, source: "aur" };
        continue;
      }

      // check if this is a pacman package
      let options = {
        uri: pacmanApiUrl,
        qs: {
          name: depend
        }, json: true
      };

      let res = await rp(options);
      if (res.results.length > 0) {
        status.packages[status.packages.length] = { name: depend, available: true, source: "pacman" };
      }
      // package is not available
      else {
        status.packages[status.packages.length] = { name: depend, available: false, source: "none" };
        status.allAvailable = false;
      }
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
      let dependPkg = new Package();

      await this.database.query(`
  			INSERT INTO depends (name, packageId, type)
  				VALUES (?, ?, ?)
  			`, [depend, packageId, type]);
    }
  }

  /**
   * Builds a package using docker and runs _extractPackage() afterwards
   * @return {Promise}
   */
  async _buildDocker() {
    // set buildscript
    let buildscript = `
      pacman -Syu --noconfirm
      pacman -S wget --noconfirm

      # install depends and make depends
      pacman -S --noconfirm --needed \
        ${this.depends.join(' ')} ${this.makeDepends.join(' ')}

      useradd -m build
      su build -s /bin/bash -c "
        mkdir ~/out
        cd ~/
        wget https://aur.archlinux.org${this.downloadUrl}
        tar -xvf '${this.name}.tar.gz' && cd '${this.name}'
        makepkg
        cp *.pkg.tar.xz ~/out/
      "`;

    let docker = new Docker();
    try {
      // create docker container
      let container = await docker
        .createContainer({
          Image: 'base/devel',
          AttachStdin: false, AttachStdout: true, AttachStderr: true, Tty: true,
          Cmd: [
            '/bin/bash', '-c', buildscript
          ],
          OpenStdin: false, StdinOnce: false
        });

      // run container
      await container.start();
      // show build log in console
      // TODO: only show when in Debug mode
      console.log('container started');
      let stream = await container.attach({ stream: true, stdout: true, stderr: true });
      stream.pipe(process.stdout);

      // wait for container to finish
      await container.wait();

      // copy created package
      stream = await container.getArchive({ path: `/home/build/out/.` });
      temp.open(`nextaur_${this.name}`, async (err, info) => {
        if (err) {
          throw err;
        }
        let wstream = fs.createWriteStream(info.path);
        stream.on('data', chunk => {
          wstream.write(chunk);
        });

        // remove container
        await container.remove();
        console.log('container removed');

        this._extractPackage(info.path);
      });
    }
    catch (err) {
      console.error(err);
    }
  }

  /**
   * Extracts a package created by build and calls _addToRepo() for all packages
   * @param  {String} packageArchive Path to package
   */
  _extractPackage(packageArchive) {
    let repo = __dirname + `/../public/test`;

    // copy packages to repo
    let files = "";
    fs
      .createReadStream(packageArchive)
      .pipe(
        tar.extract(repo, {
          map: header => {
            if (header.name !== "./") {
              this._addToRepo(header.name, repo);
            }
            return header;
          }
        })
      );
  }

  /**
   * Adds or updates a package on repo
   * @param  {String}  file Filename of the package
   * @param  {String}  repo Name of the repo
   * @return {Promise}
   */
  async _addToRepo(file, repo) {
    // run repo-add to update repo database
    exec(`
      cd "${repo}"
      repo-add -R test.db.tar.xz ${file}
    `, (error, stdout, stderr) => {
      if (error) { console.error(error); }
      if (stderr) { console.error(stderr); }
      if (stdout) { console.log(stdout); }
    });
  }
}
module.exports = Package;
