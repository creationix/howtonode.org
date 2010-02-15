var Sys = require('sys'),
    Posix = require('posix');

module.exports = {

  // Pass through native Posix for promise example
  Posix: Posix,

  // Sync api wrapper around some Posix commands
  // Sells it soul to `wait`.
  posix_sync: {
    readdir: function (path) {
      return Posix.readdir(path).wait();
    },
    stat: function (filename) {
      return Posix.stat(filename).wait();
    },
    cat: function (filename) {
      return Posix.cat(filename).wait();
    }
  },

  // Async api wrapper around some Posix commands
  // Uses continuable style for cleaner syntax
  posix: {
    readdir: function (path) { return function (next) {
      Posix.readdir(path).addCallback(next);
    }},
    stat: function (filename) { return function (next) {
      Posix.stat(filename).addCallback(next);
    }},
    cat: function (filename) { return function (next) {
      Posix.cat(filename).addCallback(next);
    }}
  },

  // Quick wrapper around puts and inspect
  debug: function debug() {
    Sys.puts(Sys.inspect.apply(this, arguments));
  },

  map: function map(array, callback) { return function (next) {
    var counter = array.length;
    var new_array = [];
    array.forEach(function (item, index) {
      callback(item, function (result) {
        new_array[index] = result;
        counter--;
        if (counter <= 0) {
          new_array.length = array.length
          next(new_array);
        }
      });
    });
  }},

  filter: function filter(array, callback) { return function (next) {
    var counter = array.length;
    var valid = {};
    array.forEach(function (item, index) {
      callback(item, function (result) {
        valid[index] = result;
        counter--;
        if (counter <= 0) {
          var result = [];
          array.forEach(function (item, index) {
            if (valid[index]) {
              result.push(item);
            }
          });
          next(result);
        }
      });
    });
  }},

  filter_map: function filter_map(array, callback) { return function (next) {
    var counter = array.length;
    var new_array = [];
    array.forEach(function (item, index) {
      callback(item, function (result) {
        new_array[index] = result;
        counter--;
        if (counter <= 0) {
          new_array.length = array.length;
          next(new_array.filter(function (item) {
            return typeof item !== 'undefined';
          }));
        }
      });
    });
  }}

};





