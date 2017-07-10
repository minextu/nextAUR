const mysql = require('mysql');
const Config = require('./config');

let config = new Config();

class Database {
	constructor() {
		this._connect(
			config.get('database:host'),
			config.get('database:user'),
			config.get('database:password'),
			config.get('database:database'));
	}

	getConnection() {
		return this.connection;
	}

	close() {
		this.connection.end();
	}
	_connect(host, user, password, database) {
		this.connection = mysql.createConnection({
			host: host,
			user: user,
			password: password,
			database: database
		});

		this.connection.connect(err => {
			if (err) {
				throw new Error(`Could not connect to Database: ${err.message}`);
			}
		});
	}
}

module.exports = Database;
