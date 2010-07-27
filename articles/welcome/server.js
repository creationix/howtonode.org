var http = require('http');

http.createServer(function (req, res) {
  setTimeout(function () {
    res.writeHead(200, {'Content-Type': 'text/plain'});
    res.end('Hello World');
  }, 2000);
}).listen(8000);

console.log('Server running at http://127.0.0.1:8000/');
