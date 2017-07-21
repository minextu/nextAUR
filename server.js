/* server entry point */
const http = require("http");
const express = require("express");
const bodyParser = require('body-parser');
const Config = require(__dirname + '/server/config');
const clientHtml = require(__dirname + '/client/htmlGenerate.js');

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

// enable support for post requests
app.use(bodyParser.urlencoded({ extended: true }));

// set api routes
var routes = require("./server/api/routes");
routes.set(app);

// generate html
app.get('*', async (req, res) => {
  clientHtml.get(req.path)
    .then((html) => { res.send(html); })
    .catch(err => {
      if (err.name === "NotFound") {
        let html = "<h1>404 Placeholder</h1>" + err.message;
        res.send(html);
      }
      else { console.error(err); res.send("Server error"); }
    });
});

// create and start server
var server = http.createServer(app);
server.listen(port, function () {
  console.log("listening on port " + port + "!");
});
