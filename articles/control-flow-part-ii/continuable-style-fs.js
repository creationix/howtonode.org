var fs = require('fs');
var newFs = module.exports = {};

Object.keys(fs).forEach(function (name) {

  // Ignore the Sync and Stream functions
  if (name.indexOf('Sync') >= 0 || name.indexOf('Stream') >= 0) {
    return;
  }

  // Wrap the other ones
  newFs[name] = function () { 
    var args = Array.prototype.slice.call(arguments);
    return function (callback, errback) {
      args.push(function (err, result) {
        if (err) errback(err);
        else callback(result);
      });
      fs[name].apply(fs, args);
    }
  };

});