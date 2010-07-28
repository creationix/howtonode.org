module.exports = function logItSetup() {

  // Initialize the counter
  var counter = 0;
  
  return function logItHandle(req, res, next) {
    var writeHead = res.writeHead; // Store the original function

    counter++;

    // Log the incoming request
    console.log("Request " + counter + " " + req.method + " " + req.url);

    // Wrap writeHead to hook into the exit path through the layers.
    res.writeHead = function (code, headers) {
      res.writeHead = writeHead; // Put the original back

      // Log the outgoing response
      console.log("Response " + counter + " " + code + " " + JSON.stringify(headers));

      res.writeHead(code, headers); // Call the original
    };

    // Pass through to the next layer
    next();
  };
};