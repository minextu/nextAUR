const rp = require('request-promise');
const to = require('await-to-js').default;
const Database = require('./database');
const Docker = require('dockerode');
const fs = require('fs');
const tar = require('tar-fs');
const exec = require('child_process').exec;
const temp = require("temp").track();

const apiUrl = "https://aur.archlinux.org/rpc/";
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
    let rows;
    [err, rows] = await to(this.database.query("SELECT * from packages WHERE name = ?", [name]));
    if (err) { console.error(err); }
    if (rows[0].length === 0) {
      throw new Error("NotFound");
    }

    let info = rows[0][0];
    this.remoteId = info.remoteId;
    this.id = info.id;
    this.name = info.name;
    this.description = info.description;
    this.version = info.version;
    this.downloadUrl = info.downloadUrl;
    this.depends = info.depends;
    this.makeDepends = info.makeDepends;
  }

  fetchName(name) {
    // set request options
    let options = {
      uri: apiUrl,
      qs: {
        v: 5,
        type: "info",
        arg: [name]
      },
      json: true
    };

    return rp(options).then(res => {
      // fail if more or less than 1 result was found
      if (res.resultcount !== 1) {
        let err = `pkg '${name}' not found`;
        throw new Error(err);
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
      this.depends = info.Depends;
      this.makeDepends = info.MakeDepends;

      return this;
    });
  }

  async save() {
    if (this.name === undefined) {
      throw new Error("Package has to fetched first!");
    }

    let testPkg = new Package();
    [err] = await to(testPkg.loadName(this.name));
    if (err) {
      if (err.message != "NotFound") { throw (err); }
    }
    else {
      throw new Error("Package was already saved!");
    }

    return this.database.query(`
			INSERT INTO packages (remoteId, name, description, version, downloadUrl)
				VALUES (?, ?, ?, ?, ?)
			`, [this.remoteId, this.name, this.description, this.version, this.downloadUrl]);
  }

  async build() {
    if (this.name === undefined) {
      throw new Error("Package has to fetched first!");
    }

    let docker = new Docker();

    try {
      let container = await docker
        .createContainer({
          Image: 'base/devel',
          AttachStdin: false,
          AttachStdout: true,
          AttachStderr: true,
          Tty: true,
          Cmd: [
            '/bin/bash', '-c',
            `
              pacman -Syu --noconfirm
              pacman -S wget --noconfirm
              useradd -m build -G wheel
              echo '%wheel ALL=(ALL) NOPASSWD: ALL' >> /etc/sudoers
              su build -s /bin/bash -c "
                mkdir ~/out
                cd ~/
                wget https://aur.archlinux.org${this.downloadUrl}
                tar -xvf '${this.name}.tar.gz' && cd '${this.name}'
                makepkg -s --noconfirm
                cp *.pkg.tar.xz ~/out/
              "
            `
          ],
          OpenStdin: false,
          StdinOnce: false
        });

      await container.start();
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

        this.extractPackage(info.path);
      });
    }
    catch (err) {
      console.error(err);
    }
  }

  extractPackage(packageArchive) {
    let repo = __dirname + `/../public/test`;

    // copy packages to repo
    let files = "";
    fs
      .createReadStream(packageArchive)
      .pipe(
        tar.extract(repo, {
          map: header => {
            if (header.name !== "./") {
              this.addToRepo(header.name, repo);
            }
            return header;
          }
        })
      );
    console.log(`file: ${files}`);
  }

  async addToRepo(file, repo) {
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
