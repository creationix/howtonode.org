var fs = require('fs');

// Here is the async version without helpers
function loaddir(path, callback) {
  fs.readdir(path, function (err, filenames) {
    if (err) { callback(err); return; }
    var realfiles = [];
    var count = filenames.length;
    filenames.forEach(function (filename) {
      fs.stat(filename, function (err, stat) {
        if (err) { callback(err); return; }
        if (stat.isFile()) {
          realfiles.push(filename);
        }
        count--;
        if (count === 0) {
          var results = [];
          realfiles.forEach(function (filename) {
            fs.readFile(filename, function (err, data) {
              if (err) { callback(err); return; }
              results.push(data);
              if (results.length === realfiles.length) {
                callback(null, results);
              };
            });
          });
        }
      });
    });
  });
}

// And it's used like this
loaddir(__dirname, function (err, result) {
  if (err) throw err;
  console.dir(result);
});
