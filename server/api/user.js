const to = require('await-to-js').default;

let err;

/**
 * Set appropriate response code and error text
 * @param  {Error} err Error object
 * @return {Array}     Answer Object
 */
function handleError(err, res) {
  let answer = {};

  if (err.name === "UserNotFound" || err.name === "InvalidPassword" || err.name === "NotLoggedIn") {
    res.status(401);
  }
  else {
    console.error(err);
    res.status(500);
  }
  answer.error = err.name;
  answer.errorText = err.message;

  res.send(answer);
}

exports.set = function setRoutes(app) {
  /**
   * @api        {get} /v1/user/status Get login status
   * @apiName    userStatus
   * @apiVersion 0.1.0
   * @apiGroup   User
   *
   * @apiSuccess {bool} status  Login status
   **/
  app.get("/api/v1/user/status", async (req, res) => {
    let answer = {};

    const User = require('../user.js');
    let user = new User();

    try {
      await user.loadSession(req.session);
      answer.status = true;
    }
    catch (err) {
      answer.status = false;
      answer.errorText = err.message;
    }

    res.send(answer);
  });

  /**
   * @api        {post} /v1/user/login Login
   * @apiName    loginUser
   * @apiVersion 0.1.0
   * @apiGroup   User
   *
   * @apiParam {String} nickname  User nickname
   * @apiParam {String} password  User password
   *
   * @apiError  UserNotFound      Nickname incorrect
   * @apiError  InvalidPassword   Wrong or invalid password
   *
   * @apiSuccess {bool} success  Status
   **/
  app.post("/api/v1/user/login", async (req, res) => {
    let answer = {};

    // get parameters
    let nick = req.body.nickname ? req.body.nickname : null;
    let password = req.body.password ? req.body.password : null;

    const User = require('../user.js');
    let user = new User();

    try {
      await user.loadNick(nick);
      await user.checkPassword(password);
      user.login(req.session);
      answer.success = true;
    }
    catch (err) {
      handleError(err, res);
      return;
    }

    res.send(answer);
  });

  /**
   * @api        {post} /v1/user/logout Logout
   * @apiName    logoutUser
   * @apiVersion 0.1.0
   * @apiGroup   User
   *
   * @apiError  NotLoggedIn  You are not logged in
   *
   * @apiSuccess {bool} success  Status
   **/
  app.post("/api/v1/user/logout", async (req, res) => {
    let answer = {};

    const User = require('../user.js');
    let user = new User();

    try {
      await user.loadSession(req.session);
      await user.logout(req.session);
    }
    catch (err) {
      handleError(err, res);
      return;
    }

    res.send(answer);
  });
};
