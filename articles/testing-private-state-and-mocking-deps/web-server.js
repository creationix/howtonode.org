// this returns either real fs or mock fs (in test)
var fs = require('fs');
var http = require('http');

var MIME_TYPE = {
  txt: 'text/plain',
  html: 'text/html',
  js: 'application/javascript'
};

// we can access and test this function directly, without instantiating anything
var extensionFromUrl = function(url) {
  return url.split('.').pop(); //.replace(/\?.*$/, '');
};

var handleRequest = function(request, response) {
  fs.readFile(__dirname + request.url, function(error, data) {
    var contentType = MIME_TYPE[extensionFromUrl(request.url)] || MIME_TYPE.txt;
    response.setHeader('Content-Type', contentType);
    response.writeHead(error ? 404 : 200);
    response.end(data);
  });
};

// the public method, the only visible property of the module
exports.createServer = function() {
  return http.createServer(handleRequest);
};
