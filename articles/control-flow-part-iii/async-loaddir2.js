var fs = require('fs'),
    helpers = require('./helpers');

// Here is the async version with filter and map helpers:
function loaddir(path, callback) {
  fs.readdir(path, function (err, filenames) {
    if (err) { callback(err); return; }
    helpers.filter(filenames, function (filename, done) {
      fs.stat(filename, function (err, stat) {
        if (err) { done(err); return; }
        done(null, stat.isFile());
      });
    }, function (err, filenames) {
      if (err) { callback(err); return; }
      helpers.map(filenames, fs.readFile, callback);
    });
  });
}

// And it's used like this
loaddir(__dirname, function (err, result) {
  if (err) throw err;
  console.dir(result);
});
