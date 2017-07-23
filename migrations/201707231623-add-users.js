module.exports = {

  // upgrade
  up: database => {
    return database.query(`
      CREATE TABLE users
      (
        id INT(255) UNSIGNED AUTO_INCREMENT ,
        nick VARCHAR(30) NOT NULL,
        hash VARCHAR(60) NULL DEFAULT NULL ,
        registerDate TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ,
        PRIMARY KEY (id), UNIQUE (nick)
      )`);
  },

  // downgrade
  down: database => {
    return database.query(`
      DROP TABLE users
    `);
  }
};
