const to = require('await-to-js').default;

let err;

exports.set = function setRoutes(app) {
  /**
	 * @api        {post} /package/add Add Package
	 * @apiName    addPkg
	 * @apiVersion 0.1.0
	 * @apiGroup   Package
	 *
	 * @apiParam {String} name  Package name
	 *
   * @apiSuccess {bool} success  Status
   *
	 * @apiError  NotFound       Package couldn't be found
	 **/
  app.post("/api/v1/package/add", async (req, res) => {
    let answer = {};

    const Package = require('../package.js');
    let pkg = new Package();

    // get parameters
    let name = req.body.name ? req.body.name : null;

    // fetch the package by name
    [err] = await to(pkg.fetchName(name));
    if (err) {
      res.status(404);
      answer.error = "NotFound";
    }

    // save the package
    if (!err) {
      await pkg.save()
        .then(() => {
          answer.success = true;
          return;
        })
        .catch(err => {
          console.error(err);
          res.status(500);
          answer.error = "UnknownError";
          answer.errorText = err.message;
        });
    }

    res.send(answer);
  });

  /**
	 * @api        {post} /package/build Build a package
	 * @apiName    buildPkg
	 * @apiVersion 0.1.0
	 * @apiGroup   Package
	 *
	 * @apiParam {String} name  Package name
	 *
   * @apiSuccess {bool} success  Status
   *
	 * @apiError  NotFound       Package couldn't be found
	 **/
  app.post("/api/v1/package/build", async (req, res) => {
    let answer = {};

    const Package = require('../package.js');
    let pkg = new Package();

    // get parameters
    let name = req.body.name ? req.body.name : null;

    // load package by name
    [err] = await to(pkg.loadName(name));
    if (err) {
      res.status(404);
      answer.error = "NotFound";
    }

    if (!err) {
      answer.success = true;

      // save the package
      pkg.build().catch(err => {
        console.error(err);
      });
    }

    res.send(answer);
  });
};
