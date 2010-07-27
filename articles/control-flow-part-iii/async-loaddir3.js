var fs = require('fs'),
    helpers = require('./helpers');

// Here is the async version with a combined filter and map helper:
function loaddir(path, callback) {
  fs.readdir(path, function (err, filenames) {
    if (err) { callback(err); return; }
    helpers.filterMap(filenames, function (filename, done) {
      fs.stat(filename, function (err, stat) {
        if (err) { done(err); return; }
        if (stat.isFile()) {
          fs.readFile(filename, done);
          return;
        }
        done();
      });
    }, callback);
  });
}

// And it's used like this
loaddir(__dirname, function (err, result) {
  if (err) throw err;
  console.dir(result);
});
