/**
 * @apiDefine Permissions
 * @apiError NotLoggedIn  You need to be logged in
 */

const User = require('../user.js');

/**
 * Get logged in user
 * @return {Promise} User object, if user is logged in, False otherwise
 */
async function getLoginUser(session) {
  let user = new User();
  return user.loadSession(session);
}

exports.set = function setRoutes(app) {
  app.get("/api", (req, res) => {
    res.send("<h1>nextaur API</h1>Please visit the <a href='../apidoc'>API Documentation</a>");
  });

  // set routes for all api groups
  require('./package.js').set(app, getLoginUser);
  require('./repo.js').set(app, getLoginUser);
  require('./user.js').set(app);

  app.get("/api/*", (req, res) => {
    res.send({ error: "ApiNotFound" });
  });
};
