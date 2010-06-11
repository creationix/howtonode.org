var sys = require('sys');

// Initialize the counter
exports.setup = function setup() {
  this.counter = 0;
};

exports.handle = function handle(req, res, next) {
  var writeHead = res.writeHead; // Store the original function
  
  var counter = this.counter++;

  // Log the incoming request
  sys.puts("Request " + counter + " " + req.method + " " + req.url);

  // Wrap writeHead to hook into the exit path through the layers.
  res.writeHead = function (code, headers) {
    res.writeHead = writeHead; // Put the original back
    
    // Log the outgoing response
    sys.puts("Response " + counter + " " + code + " " + JSON.stringify(headers));
             
    res.writeHead(code, headers); // Call the original
  };
  
  // Pass through to the next layer
  next();
};