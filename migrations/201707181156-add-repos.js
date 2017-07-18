module.exports = {

  // upgrade
  up: database => {
    return database.query(`
			CREATE TABLE repos
			(
				id INT(255) UNSIGNED AUTO_INCREMENT ,
				name VARCHAR(100) NOT NULL,
				PRIMARY KEY (id)
			)`);
  },

  // downgrade
  down: database => {
    return database.query(`
			DROP TABLE repos
			`);
  }
};
