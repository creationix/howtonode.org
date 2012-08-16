var fs = require('fs');

var getLastModified = function(files, done) {
  var timestamps = [];

  files.forEach(function(file) {
    fs.stat(file, function(err, stat) {
      timestamps.push(stat.mtime);

      if (timestamps.length === files.length) {
        done(null, timestamps);
      }
    });
  });
};
