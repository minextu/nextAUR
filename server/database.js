const Config = require('./config');

let config = new Config();
let env = config.get('enviroment');

let knexConfig = require('../knexfile.js');
let knex = require('knex')(knexConfig[env]);

module.exports = knex;
