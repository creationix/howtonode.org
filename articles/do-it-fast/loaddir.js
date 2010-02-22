process.mixin(require('sys'));

function errorHandler(error) {
  throw error;
}

var Do = require('do');
var fs = Do.convert(require('fs'), ['readdir', 'stat', 'readFile']);

// Checks the `stat` of a file path and outputs the file contents if it's
// a real file
function loadFile(path, callback, errback) {
  fs.stat(path)(function (stat) {
    
    // Output undefined when the path isn't a regular file
    if (!stat.isFile()) {
      callback();
      return;
    }

    // Pass through the read to regular files as is.
    fs.readFile(path)(callback, errback)

  }, errback);
}

// Load an array of the contents of all files in a directory.
function loaddir(path) { return function (callback, errback) {
  fs.readdir(path)(function (filenames) {
    Do.filterMap(filenames, loadFile)(callback, errback);
  }, errback);
}}

loaddir(__dirname)(p, errorHandler)
