var http = require('http');

http.createServer(function (req, res) {
  var chunks = [];
  req.addListener('data', function (chunk) {
    chunks.push(chunk);
  });
  req.addListener('end', function () {
    // Do something with body text
    console.dir(chunks);
  });
}).listen(8080);

console.log("Server started on http://localhost:8080/");
