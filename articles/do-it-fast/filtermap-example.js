// Direct callback filter
var files = ['users.json', 'pages.json', 'products.json'];
function check_and_load(filename, callback, errback) {
  fs.stat(filename)(function (stat) {
    if (stat.isFile()) {
      loadFile(filename, callback, errback);
    } else {
      callback();
    }
  }, errback);
}
Do.filterMap(files, check_and_load)(function (filtered_files_with_data) {
  // Do something
}, errorHandler);

// Continuable based filter
var files = ['users.json', 'pages.json', 'products.json'];
function check_and_load(filename) { return function (callback, errback) {
  fs.stat(filename)(function (stat) {
    if (stat.isFile()) {
      loadFile(filename, callback, errback);
    } else {
      callback();
    }
  }, errback);
}}
Do.filterMap(files, check_and_load)(function (filtered_files_with_data) {
  // Do something
}, errorHandler);