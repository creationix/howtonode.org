
function errorHandler(error) {
  throw error;
}

var Do = require('do');
// Convert `readFile` from fs to use continuable style.
var fs = Do.convert(require('fs'), ['readFile']);

function safeRead(filename) { return function (callback, errback) {
  fs.readFile(filename)(callback, function (error) {
    if (error.errno === process.ENOENT) {
      callback("");
    } else {
      errback(error);
    }
  })
}}

safeRead(__filename)(console.log, errorHandler);
