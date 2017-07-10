/* server entry point */

const http = require("http");
const express = require("express");
const Config = require("./server/config");

// get config
let config = new Config();
let port = config.get('port');

// catch port in use error
process.on("uncaughtException", function (err) {
	if (err.errno === "EADDRINUSE") {
		console.log("Port is in use!");
	}
	else {
		console.log(err);
	}
	process.exit(1);
});

// set static content
var app = express();
app.use(express.static("public"));

// set routes
var routes = require("./server/routes");
routes.set(app);

// create and start server
var server = http.createServer(app);
server.listen(port, function () {
	console.log("listening on port " + port + "!");
});
