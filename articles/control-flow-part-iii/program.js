process.mixin(require('./helpers'));

// Scan a directory for files
// Filter out directories
// Read contents of files

// Here is the sync version:
function loaddir_sync(path) {
 return posix_sync.readdir(path).filter(function (filename) {
   return posix_sync.stat(filename).isFile();
 }).map(function (filename) {
   return [filename, posix_sync.cat(filename)];
 });
}
debug(loaddir_sync(__dirname));

// Here is the async version without helpers
function loaddir1(path) { return function (next) {
  posix.readdir(path)(function (filenames) {
    var realfiles = [];
    var count = filenames.length;
    filenames.forEach(function (filename) {
      posix.stat(filename)(function (stat) {
        if (stat.isFile()) {
          realfiles.push(filename);
        }
        count--;
        if (count <=0) {
          var results = [];
          realfiles.forEach(function (filename) {
            posix.cat(filename)(function (data) {
              results.push([filename, data]);
              if (results.length === realfiles.length) {
                next(results);
              }
            });
          });
        }
      });
    });
  });
}}
loaddir1(__dirname)(debug);


// Here is the async version with filter and map helpers:
function loaddir2(path) { return function (next) {
  posix.readdir(path)(function (filenames) {
    filter(filenames, function (filename, callback) {
      posix.stat(filename)(function (stat) {
        callback(stat.isFile());
      });
    })(function (filenames) {
      map(filenames, function (filename, callback) {
        posix.cat(filename)(function (data) {
          callback([filename, data]);
        });
      })(next);
    });
  });
}}
loaddir2(__dirname)(debug);


// Here is the async version with a combined filter and map helper:
function loaddir3(path) { return function (next) {
  posix.readdir(path)(function (filenames) {
    filter_map(filenames, function (filename, callback) {
      posix.stat(filename)(function (stat) {
        if (stat.isFile()) {
          posix.cat(filename)(function (data) {
            callback([filename, data]);
          });
        } else {
          callback();
        }
      });
    })(next);
  });
}}
loaddir3(__dirname)(debug);

// Sample using vanilla promises for comparison
function loaddir4(path) {
  var promise = new process.Promise();
  Posix.readdir(path).addCallback(function (filenames) {
    var realfiles = [];
    var count = filenames.length;
    filenames.forEach(function (filename) {
      Posix.stat(filename).addCallback(function (stat) {
        if (stat.isFile()) {
          realfiles.push(filename);
        }
        count--;
        if (count <=0) {
          var results = [];
          realfiles.forEach(function (filename) {
            Posix.cat(filename).addCallback(function (data) {
              results.push([filename, data]);
              if (results.length === realfiles.length) {
                promise.emitSuccess(results);
              }
            });
          });
        }
      });
    });
  });
  return promise;
}
loaddir4(__dirname).addCallback(debug);


