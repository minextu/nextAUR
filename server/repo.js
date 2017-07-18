const error = require('./error.js');
const to = require('await-to-js').default;
const Database = require('./database');
const fs = require('fs');

const repoTarget = __dirname + `/../public/`;
let err;

class Repo {
  constructor() {
    this.database = new Database();
  }

  /**
   * Load repo by id
   * @param  {Number} id Id of repo
   * @return {Promise}
   */
  async loadId(id) {
    // get repo info
    let repos;
    [err, repos] = await to(this.database.query(`
      SELECT * from repos WHERE id = ?
    `, [id]));
    if (err) { console.error(err); }
    if (repos[0].length === 0) {
      throw new error.NotFound(`repo with id '${id}' not found in database`);
    }

    // set info
    let info = repos[0][0];
    this.id = info.id;
    this.name = info.name;
  }

  /**
   * Load repo by name
   * @param  {String} name Name of repo
   * @return {Promise}
   */
  async loadName(name) {
    // get repo info
    let repos;
    [err, repos] = await to(this.database.query(`
      SELECT * from repos WHERE name = ?
    `, [name]));
    if (err) { console.error(err); }
    if (repos[0].length === 0) {
      throw new error.NotFound(`repo '${name}' not found in database`);
    }

    // set info
    let info = repos[0][0];
    this.id = info.id;
    this.name = info.name;
  }

  /**
   * Get all available repos
   * @return {Promise} A list of Repo objects on resolve
   */
  async getAll() {
    let repoList = [];

    // get repo info
    let repos;
    [err, repos] = await to(this.database.query(`
      SELECT id from repos
    `));
    if (err) { console.error(err); }

    for (let index in repos[0]) {
      let id = repos[0][index].id;
      let repo = new Repo();

      [err] = await to(repo.loadId(id));
      if (err) { throw err; }

      repoList[repoList.length] = repo;
    }

    return repoList;
  }

  /**
   * Check if name contains valid characters and set name
   * @param {String} name Repo name
   */
  setName(name) {
    if (!name || !name.match(/^[0-9a-zA-Z_-]+$/)) {
      throw new error.InvalidCharacters("Invalid characters in repo name");
    }

    this.name = name;
  }

  getId() {
    return this.id;
  }

  getPath() {
    return `${repoTarget}/${this.name}`;
  }

  getName() {
    return this.name;
  }

  /**
   * Save Repo to database and create folder
   * @return {Promise}
   */
  async save() {
    if (this.id !== undefined) {
      throw new Error("An existing repo can't be saved");
    }
    if (this.name === undefined) {
      throw new Error("Repo Name has to be set first!");
    }

    // check if repo does already exist in database
    let testRepo = new Repo();
    [err] = await to(testRepo.loadName(this.name));
    if (!err) {
      throw new error.Exists(`Repo '${this.name}' does already exit in Database`);
    }
    else if (err && err.name !== "NotFound") {
      throw (err);
    }

    // save repo to database
    [err] = await to(this.database.query(`
      INSERT INTO repos (name)
      VALUES (?)
    `, [this.name]));

    if (err) { throw err; }

    // create folder
    return new Promise((resolve, reject) => {
      fs.mkdir(this.getPath(), err => {
        if (err) { reject(err); }
        resolve();
      });
    });
  }
}

module.exports = Repo;
