module.exports = {

	// upgrade
	up: database => {
		return database.query(`
			CREATE TABLE packages
			(
				id INT(255) UNSIGNED NULL AUTO_INCREMENT ,
				remoteId INT(255) UNSIGNED NULL ,
				name VARCHAR(100) NOT NULL ,
				description VARCHAR(10000) NOT NULL ,
				version VARCHAR(100) NULL ,
				downloadUrl VARCHAR(1000) NULL ,
				PRIMARY KEY (id)
			)`);
	},

	// downgrade
	down: database => {
		return database.query(`
			DROP TABLE packages
			`);
	}
};
