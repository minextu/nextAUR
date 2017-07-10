const options = {
	storageOptions: {
		path: './config/migrations.json',
	},
	logging: (log) => console.log(log)
};

class Migrator {
	constructor() {
		let Umzug = require('umzug');
		this.umzug = new Umzug(options);
	}

	getPending() {
		return this.umzug.pending();
	}

	getExecuted() {
		return this.umzug.executed();
	}

	upgrade() {
		return this.umzug.up();
	}

	downgrade(file) {
		return this.umzug.down(file);
	}
}

module.exports = Migrator;
