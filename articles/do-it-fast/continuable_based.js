process.mixin(require('sys'));

function error_handler(error) {
  throw error;
}

var Do = require('do');
// Convert `readFile` from fs to use continuable style.
var fs = Do.convert(require('fs'), ['readFile']);

function safe_read(filename) { return function (callback, errback) {
  fs.readFile(filename)(callback, function (error) {
    if (error.message === 'No such file or directory') {
      callback("");
    } else {
      errback(error);
    }
  })
}}

safe_read(__filename)(puts, error_handler);
