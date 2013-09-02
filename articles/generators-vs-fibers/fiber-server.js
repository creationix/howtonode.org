var http = require('http');
var Fiber = require('fibers');

//server
http.createServer(function onRequest(req, res) {
  Fiber(function () {
    var body;
    try {
      body = handleRequest(req);
    }
    catch (err) {
      res.statusCode = 500;
      res.setHeader("Content-Type", "text/plain");
      res.end(err.stack);
      return;
    }
    res.statusCode = 200;
    res.setHeader("Content-Type", "application/json");
    res.setHeader("Content-Length", body.length);
    res.end(body);
  }).run();
}).listen(3000);
console.log("Server running at http://localhost:3000/");


//hide
var query = require('./query.js');
//handler
var requestCount = 0;
function handleRequest(req) {
  requestCount++;
  var result = query(req);
  result.requestCount = requestCount;
  return new Buffer(JSON.stringify(result) + "\n");
}
