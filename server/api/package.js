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
	 * @apiError  MissingValues  Package name wasn't transmitted
	 * @apiError  NotFound       Package couldn't be found
	 **/
	app.post("/api/v1/package/add", async (req, res) => {
		let answer = {};

		const Package = require('../package.js');
		let pkg = new Package();

		// get parameters and check for errors
		let name = req.body.name ? req.body.name : null;
		if (name === null) {
			res.status(400);
			answer.error = "MissingValues";
		}
		// run code, if everything is ok
		else {
			await pkg.fetchName(name)
				.then(() => {
					// save package to database
					return pkg.save();
				}, () => {
					throw new Error("NotFound");
				})
				.then(() => {	answer.success = true; })
				.catch(err => {
					if (err.message === "NotFound") {
						res.status(404);
						answer.error = "NotFound";
					}
					else {
						console.error(err);
						res.status(500);
						answer.error = "UnknownError";
						answer.errorText = err.message;
					}
				});
		}

		res.send(answer);
	});
};
