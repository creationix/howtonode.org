var fs = require('fs');

function read_directory(path, next) {
  fs.readdir(".", function (err, files) {
    var count = files.length,
        results = {};
    files.forEach(function (filename) {
      fs.readFile(filename, function (data) {
        results[filename] = data;
        count--;
        if (count <= 0) {
          next(results);
        }
      });
    });
  });
}

function read_directories(paths, next) {
  var count = paths.length,
      data = {};
  paths.forEach(function (path) {
    read_directory(path, function (results) {
      data[path] = results;
      count--;
      if (count <= 0) {
        next(data);
      }
    });
  });
}

read_directories(['articles', 'authors', 'skin'], function (data) {
  // Do something
});
