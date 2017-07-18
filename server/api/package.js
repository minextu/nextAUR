const to = require('await-to-js').default;

let err;

/**
 * Set appropriate response code and error text
 * @param  {Error} err Error object
 * @return {Array}     Answer Object
 */
function handleError(err, res) {
  let answer = {};

  if (err.name === "NotFound") { res.status(404); }
  else if (err.name === "Exists") { res.status(409); }
  else if (err.name === "Dependency") { res.status(412); }
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
   * @api        {post} /package/add Add package to repo
   * @apiName    addPkg
   * @apiVersion 0.1.0
   * @apiGroup   Package
   *
   * @apiParam {String} name  Package name
   * @apiParam {Number} repo  Repo id
   *
   * @apiSuccess {bool} success  Status
   *
   * @apiError  NotFound  Package couldn't be found
   * @apiError  Exists    Package has already been added
   **/
  app.post("/api/v1/package/add", async (req, res) => {
    let answer = {};

    const Package = require('../package.js');
    let pkg = new Package();

    // get parameters
    let name = req.body.name ? req.body.name : null;
    let repo = req.body.repo ? req.body.repo : null;

    // fetch the package by name
    [err] = await to(pkg.fetchName(name));
    if (err) {
      handleError(err, res);
      return;
    }

    // set repo
    [err] = await to(pkg.setRepo(repo));
    if (err) {
      handleError(err, res);
      return;
    }

    // save the package
    answer.success = true;
    [err] = await to(pkg.save());
    if (err) {
      handleError(err, res);
      return;
    }

    res.send(answer);
  });

  /**
   * @api        {post} /package/build Build a package
   * @apiName    buildPkg
   * @apiVersion 0.1.0
   * @apiGroup   Package
   *
   * @apiParam {Number} id  Package id
   *
   * @apiSuccess {bool} success  Status
   *
   * @apiError  NotFound    Package couldn't be found
   * @apiError  Dependency  Not all dependencies are available
   **/
  app.post("/api/v1/package/build", async (req, res) => {
    let answer = {};

    const Package = require('../package.js');
    let pkg = new Package();

    // get parameters
    let id = req.body.id ? req.body.id : null;

    // load package by id
    [err] = await to(pkg.loadId(id));
    if (err) {
      handleError(err, res);
      return;
    }

    answer.success = true;
    // build the package
    [err] = await to(pkg.build());
    if (err) {
      handleError(err, res);
      return;
    }

    res.send(answer);
  });

  /**
 * @api        {get} /package/list Get all Packages in repo
 * @apiName    listPackages
 * @apiVersion 0.1.0
 * @apiGroup   Package
 *
 * @apiParam {Number} repo  Repo id
 *
 * @apiSuccess {Array} packages  A list of all packages
 **/
  app.get("/api/v1/package/list", async (req, res) => {
    let answer = {};

    // get parameters
    let repo = req.query.repo ? req.query.repo : null;

    const Package = require('../package.js');
    let pkg = new Package();

    let packages;
    [err, packages] = await to(pkg.getAll(repo));
    if (err) {
      handleError(err, res);
      return;
    }

    let packageList = [];
    for (let i in packages) {
      packageList[packageList.length] = { id: packages[i].getId(), name: packages[i].getName() };
    }
    answer.packages = packageList;

    res.send(answer);
  });
};
