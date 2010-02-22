process.mixin(require('sys'));

function error_handler(error) {
  throw error;
}

// Load 'fs', a built-in node library that has async functions
var fs = require('fs');

function safe_read(filename, callback) {
  fs.readFile(filename, function (err, data) {
    if (err) {
      if (err.message === 'No such file or directory') {
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

safe_read(__filename, function (err, text) {
  if (err) {
    error_handler(err);
  } else {
    puts(text);
  }
});
