const configDefaults = {
	port: 8080,
	database: {}
};

class Config {
	constructor(file = __dirname + '/../config/config.json') {
		this.file = file;

		// init nconf
		this.nconf = require('nconf');
		// consider command line arguments and enviroment variables
		this.nconf.argv().env();
		// set file
		this.nconf.file({
			file: this.file
		});
		// set defaults
		this.nconf.defaults(configDefaults);
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
