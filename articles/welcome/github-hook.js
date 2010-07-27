var http = require('http'),
    rebuild = require('./builder').rebuild;

http.createServer(function (req, res) {
  rebuild(function (output) {
    res.writeHead(200, {'Content-Type': 'text/plain'});
    res.end(output);
  })
}).listen(8000);

console.log('Github hook running at http://127.0.0.1:8000/');
