const temp = require("temp").track();
const Dockerode = require("dockerode");
const fs = require('fs');

class Docker {
  constructor() {
    this.docker = new Dockerode();
  }

  /**
   * Create a new container and run the given script
   * @param  {String}  script The script to run after starting the container
   * @return {Promise}
   */
  async create(script) {
    // create docker container
    this.container = await this.docker.createContainer({
      Image: 'base/devel',
      AttachStdin: false, AttachStdout: true, AttachStderr: true, Tty: true,
      Cmd: [
        '/bin/bash', '-c', script
      ],
      OpenStdin: false, StdinOnce: false
    });
  }

  /**
   * Start the container
   * @return {Promise}
   */
  async start() {
    return this.container.start();
  }

  setContainer(id) {
    this.container = this.docker.getContainer(id);
  }

  /**
   * Copy the given tar stream to container in /srv/http
   * @param  {Stream}  dependencyStream Tar stream containing dependency packages
   * @return {Promise}
   */
  async copyDependencies(dependencyStream) {
    let archive = await new Promise((resolve, reject) => {
      temp.open(`nextaur_dependencies`, async (err, info) => {
        if (err) {
          reject(err);
        }

        let wstream = fs.createWriteStream(info.path);
        dependencyStream.pipe(wstream);

        wstream.on('finish', () => resolve(info.path));
      });
    });

    // copy tar to container
    await this.container.putArchive(archive, { path: '/srv/http' });
  }
}

module.exports = Docker;
