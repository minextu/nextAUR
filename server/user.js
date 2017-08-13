const error = require('./error.js');
const to = require('await-to-js').default;
const db = require('./database');
const bcrypt = require('bcrypt');
const saltRounds = 10;

/**
 * Can Create and Load Info about a User using a Database
 */
class User {
  getId() {
    if (this.id === undefined) {
      throw new Error("User has to be loaded first.");
    }
    return this.id;
  }

  getNick() {
    if (this.nick === undefined) {
      throw new Error("User has to be loaded first.");
    }
    return this.nick;
  }

  getEmail() {
    if (this.id === undefined) {
      throw new Error("User has to be loaded first.");
    }
    return this.email;
  }

  /**
   * Set User Nickname
   *
   * Throws InvalidNickname on invalid nicknames
   *
   * @param {String} nick user nickname
   */
  async setNick(nick) {
    let testUser = new User();

    // check if nick does already exist
    let [err] = await to(testUser.loadNick(nick));
    if (!err) {
      throw new error.InvalidNickname("Nickname does already exist.");
    }
    else if (err.name !== "UserNotFound") {
      console.log(err.name);
      throw err;
    }

    if (nick.length < 3) {
      throw new error.InvalidNickname("Nickname is too short");
    }
    if (nick.length > 30) {
      throw new error.InvalidNickname("Nickname is too long");
    }

    this.nick = nick;
  }

  setEmail(email) {
    this.email = email;
    return this;
  }

  /**
   * Set User Password
   *
   * Throws InvalidPasswordException on invalid Passwords
   *
   * @param  {String} password user password
   * @return {Promise}
   */
  async setPassword(password) {
    if (password.length < 6) {
      throw new error.InvalidPassword("Password is too short");
    }
    this.hash = await this._hashPassword(password);
  }

  /**
   * Load User Info using a nickname
   *
   * Throws UserNotFound
   *
   * @param   {String} nick   nickname to search for
   * @return {Promise}
   */
  async loadNick(nick) {
    let [err, userData] = await to(
      db('users').where('nick', nick)
    );
    if (err) { console.error(err); }
    if (userData.length === 0) {
      throw new error.UserNotFound(`User '${nick}' not found`);
    }

    return this._load(userData[0]);
  }
  /**
   * Load User Info using the unique Id
   *
   * Throws UserNotFound
   *
   * @param  {Number} id Unique user id
   * @return {Promise}
   */
  async loadId(id) {
    let [err, userData] = await to(
      db('users').where('id', id)
    );

    if (err) { console.error(err); }
    if (userData.length === 0) {
      throw new error.UserNotFound(`User id '${id}' not found`);
    }
    return this._load(userData[0]);
  }

  /**
   * Load user info using a session
   * @param  {Object}  session Session to be used
   * @return {Promise}
   */
  async loadSession(session) {
    if (session.loginUserId === undefined) {
      throw new error.NotLoggedIn("User is not logged in");
    }

    return this.loadId(session.loginUserId);
  }

  /**
   * Login this user using the given session
   * @param  {Object}  session Session to be used
   */
  login(session) {
    if (this.id === undefined) {
      throw new Error("User has to be loaded first");
    }

    session.loginUserId = this.id;
  }

  /**
   * Logout this user using the given session
   * @param  {Object}  session Session to be used
   */
  logout(session) {
    if (this.id === undefined) {
      throw new Error("User has to be loaded first");
    }

    delete session.loginUserId;
  }

  /**
   * Assign Values to all attributes using a user array
   *
   * @param  {Array} user User Array created by Database.query
   */
  _load(user) {
    this.id = user.id;
    this.nick = user.nick;
    this.email = user.email;
    this.hash = user.hash;
    this.rank = user.rank;

    return this;
  }

  /**
   * Check if the given Password is correct for this User
   *
   * Throws WrongPassword
   *
   * @param  {String} password    Password to be checked
   * @return {Promise}
   */
  async checkPassword(password) {
    if (this.hash === undefined) {
      throw new Error("User has to be loaded first.");
    }
    if (password === null || password.length === 0) {
      throw new error.InvalidPassword("No password given");
    }

    let [err, result] = await to(bcrypt.compare(password, this.hash));
    if (err) { throw err; }
    if (!result) {
      throw new error.InvalidPassword(`Wrong password for '${this.nick}'`);
    }
  }
  /**
   * Save User to Database
   *
   * @return {Promise}
   */
  async create() {
    if (this.id !== undefined) {
      throw new Error("User was loaded and is not allowed to be recreated.");
    }
    if (this.nick === undefined) {
      throw new Error("Nickname has to set via setNick first.");
    }
    if (this.hash === undefined) {
      throw new Error("Password has to set via setPassword first.");
    }

    let [err, result] = await to(
      db('users').insert({
        nick: this.nick,
        hash: this.hash
      })
    );

    if (err) { throw err; }

    this.id = result[0].insertId;
  }

  /**
   * Hash Password string
   *
   * @param  {String} password Password to be hashed
   * @return {Promise}         Hashed Password
   */
  async _hashPassword(password) {
    return bcrypt.hash(password, saltRounds)
      .then(hash => {
        if (hash.length !== 60) { throw new Error("Invalid Hash"); }
        return hash;
      });
  }
}

module.exports = User;
