//routes
module.exports = function (app) {
  
  // Read a value from the database
  app.get("/:key", function (req, res, next) {
    // Load from the database
    var item = data[req.params.key];
    // 404 if it doesn't exist
    if (!item) { next(); return; }
    // Serve the item to the client
    sendItem(res, item);
  });
  
  // Save a value to the database
  app.put("/:key", function (req, res, next) {
    // Create/insert the item in the database
    var item = data[req.params.key] = {
      value: req.body,
      mtime: new Date
    };
    // Serve the item to the client
    sendItem(res, item);
  });
  
  // Remove a value from the database
  app.del("/:key", function (req, res, next) {
    var key = req.params.key;
    // Load from the database
    var item = data[key];
    // 404 if it doesn't exist
    if (!item) { next(); return; }
    // Delete it
    delete data[key];
    // Send an empty OK response
    res.writeHead(204, {});
    res.end();
  });

};
//rest
// Simplest database ever!
var data = {
  greeting:  {
    value: {hello: "world"},
    mtime: new Date
  }
};

// Helper for sending items
function sendItem(res, item) {
  // Send the response
  res.writeHead(200, {
    "Content-Type": "application/json",
    "Last-Modified": item.mtime.toUTCString()
  });
  res.end(JSON.stringify(item.value));
}
