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
	 * @apiError  Exists         Package has already been added
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
      handleError(err, res);
      return;
    }

    // save the package
    await pkg.save()
      .then(() => {
        answer.success = true;
        return;
      })
      .catch(err => {
        handleError(err, res);
        return;
      });
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
      handleError(err, res);
      return;
    }

    answer.success = true;
    // save the package
    pkg.build().catch(err => {
      handleError(err, res);
      return;
    });

    res.send(answer);
  });
};
