// Direct callback filter
var files = ['users.json', 'pages.json', 'products.json'];
function isFile(filename, callback, errback) {
  fs.stat(filename)(function (stat) {
    callback(stat.isFile());
  }, errback);
}
Do.filter(files, isFile)(function (filtered_files) {
  // Do something
}, errorHandler);

// Continuable based filter
var files = ['users.json', 'pages.json', 'products.json'];
function isFile(filename) { return function (callback, errback) {
  fs.stat(filename)(function (stat) {
    callback(stat.isFile());
  }, errback);
}}
Do.filter(files, isFile)(function (filtered_files) {
  // Do something
}, errorHandler);