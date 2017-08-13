module.exports = {

  development: {
    client: 'sqlite3',
    connection: {
      filename: './dev.sqlite3'
    },
    useNullAsDefault: true,
    migrations: {
      tableName: 'knex_migrations'
    }
  },

  production: {
    client: 'sqlite3',
    connection: {
      filename: './production.sqlite3'
    },
    useNullAsDefault: true,
    migrations: {
      tableName: 'knex_migrations'
    }
  }

};
