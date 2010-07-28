var Connect = require('connect');

Connect.createServer(function (req, res, next) {
  // Every request gets the same "Hello Connect" response.
  res.simpleBody(200, "Hello Connect");
}).listen(8080);