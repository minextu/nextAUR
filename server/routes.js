exports.set = function setRoutes(app) {
	app.get("/api", function (req, res) {
		res.send("<h1>nextaur API</h1>Please visit the <a href='../apidoc'>API Documentation</a>");
	});

	/**
	 * @api        {get} /dummy dummy
	 * @apiName    dummy
	 * @apiVersion 0.1.0
	 * @apiGroup   Dummy
	 **/
	app.get("/api/v1/dummy", function (req, res) {
		let answer = "Test";
		res.send(answer);
	});
};
