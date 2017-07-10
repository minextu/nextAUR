const mysql = require('mysql2/promise');
const Config = require('./config');

let config = new Config();
let connection;

class Database {
	constructor() {

	}

	async query(sql, arg) {
		if (connection === undefined) {
			await this._connect();
		}
		return connection.execute(sql, arg);
	}

	close() {
		if (connection !== undefined) {
			connection.end();
		}
	}

	async _connect(host, user, password, database) {
		host = host ? host : config.get('database:host');
		user = user ? user : config.get('database:user');
		password = password ? password : config.get('database:password');
		database = database ? database : config.get('database:database');

		connection = await mysql.createConnection({
			host: host,
			user: user,
			password: password,
			database: database
		});

		connection.connect(err => {
			if (err) {
				throw new Error(`Could not connect to Database: ${err.message}`);
			}
		});
	}
}

module.exports = Database;
