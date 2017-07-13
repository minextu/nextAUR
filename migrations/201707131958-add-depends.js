module.exports = {

  // upgrade
  up: database => {
    return database.query(`
			CREATE TABLE depends
			(
				id INT(255) UNSIGNED AUTO_INCREMENT ,
				name VARCHAR(100) NOT NULL,
				packageId INT(255) UNSIGNED NOT NULL,
				type INT(1) UNSIGNED NULL,
				PRIMARY KEY (id)
			)`);
  },

  // downgrade
  down: database => {
    return database.query(`
			DROP TABLE depends
			`);
  }
};
