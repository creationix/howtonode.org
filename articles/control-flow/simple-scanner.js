var fs = require('fs');

fs.readdir(".", function (err, files) {
  var count = files.length,
      results = {};
  files.forEach(function (filename) {
    fs.readFile(filename, function (data) {
      results[filename] = data;
      count--;
      if (count <= 0) {
        // Do something once we know all the files are read.
      }
    });
  });
});
