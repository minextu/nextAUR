class Config {
  constructor(file = __dirname + '/../config/config.json') {
    this.file = file;

    // init nconf
    this.nconf = require('nconf')
      // set file
      .file({
        file: this.file
      })
      // set default file
      .file('defaults', __dirname + '/../config/config.sample.json')
      // consider command line arguments and enviroment variables
      .argv().env();
  }

  get(config) {
    return this.nconf.get(config);
  }

  set(config, value) {
    this.nconf.set(config, value);
    return this._save();
  }

  _save() {
    return new Promise((resolve, reject) => {
      this.nconf.save(err => {
        if (err !== null) {
          reject(err);
        }
        else {
          resolve();
        }
      });
    });
  }
}

module.exports = Config;
