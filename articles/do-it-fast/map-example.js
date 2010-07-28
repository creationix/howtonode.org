// Direct callback filter
var files = ['users.json', 'pages.json', 'products.json'];
function loadFile(filename, callback, errback) {
  fs.read(filename)(function (data) {
    callback([filename, data]);
  }, errback);
}
Do.map(files, loadFile)(function (contents) {
  // Do something
}, errorHandler);

// continuable based filter
var files = ['users.json', 'pages.json', 'products.json'];
Do.map(files, fs.read)(function (contents) {
  // Do something
}, errorHandler);