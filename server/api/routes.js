exports.set = function setRoutes(app) {
  app.get("/api", (req, res) => {
    res.send("<h1>nextaur API</h1>Please visit the <a href='../apidoc'>API Documentation</a>");
  });

  // set routes for all api groups
  require('./package.js').set(app);
};
