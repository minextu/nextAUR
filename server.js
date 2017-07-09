var http = require("http");
var express = require("express");

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

// get server port of arguments list
let port = process.argv[2];
if (port === undefined) {
	port = 8080;
}

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
