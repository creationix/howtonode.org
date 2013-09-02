var run = require('gen-run');
var http = require('http');

//server
http.createServer(function onRequest(req, res) {
  run(handleRequest(req), function onResponseBody(err, body) {
    if (err) {
      res.statusCode = 500;
      res.setHeader("Content-Type", "text/plain");
      res.end(err.stack);
      return;
    }
    res.statusCode = 200;
    res.setHeader("Content-Type", "application/json");
    res.setHeader("Content-Length", body.length);
    res.end(body);
  });
}).listen(3000);
console.log("Server running at http://localhost:3000/");

//hide
var query = require('./query.js');
//handler
var requestCount = 0;
function* handleRequest(req) {
  requestCount++;
  var result = query(req);
  result.requestCount = requestCount;
  return new Buffer(JSON.stringify(result) + "\n");
}

//hide
var query = require('./continuable-query.js');
//continuable-handler
var requestCount = 0;
function* handleRequest(req) {
  requestCount++;
  var result = yield query(req);
  result.requestCount = requestCount; // Uh-Oh!
  return new Buffer(JSON.stringify(result) + "\n");
}

//hide
var query = require('./generator-query.js');
//generator-handler
var requestCount = 0;
function* handleRequest(req) {
  requestCount++;
  var result = yield* query(req);
  result.requestCount = requestCount; // Uh-Oh!
  return new Buffer(JSON.stringify(result) + "\n");
}
