// Load two build-in node modules
var http = require('http'),
    sys = require('sys');

// Set up a request handler
function onRequest(request, response) {
  // Simple request logging
  sys.puts("Request from " + request.url);
  
  if (request.url === '/') {
    // Respond with "Hello World" for the root url
    response.writeHead(200, {"Content-Type": "text/plain"})
    response.write("Hello World");
    response.end();
  } else {
    // Otherwise render a simple 404 page 
    response.writeHead(400, {"Content-Type": "text/plain"});
    response.end("I understand " + request.url);
  }
  
}

// Start the server and listen on port 8080
http.createServer(onRequest).listen(8080);
sys.puts("HTTP server listening on port 8080");