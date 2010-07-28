
function errorHandler(error) {
  throw error;
}

// Load 'fs', a built-in node library that has async functions
var fs = require('fs');

function safeRead(filename, callback) {
  fs.readFile(filename, function (err, data) {
    if (err) {
      if (error.errno === process.ENOENT) {
        // Ignore file not found errors and return an empty result
        callback(null, "");
      } else {
        // Pass other errors through as is
        callback(err);
      }
    } else {
      // Pass successes through as it too.
      callback(null, data);
    }
  })
}

safeRead(__filename, function (err, text) {
  if (err) {
    errorHandler(err);
  } else {
    console.log(text);
  }
});
