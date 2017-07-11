let options = {
  storageOptions: {
    path: './config/migrations.json',
  },
  logging: (log) => console.log(log)
};

class Migrator {
  constructor(database) {
    if (!database) {
      throw new Error("database was not given!");
    }

    this.database = database;
    options.migrations = {
      params: [database]
    };

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
