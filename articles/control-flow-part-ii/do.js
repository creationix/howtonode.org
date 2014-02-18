var Do = {
  parallel: function (fns) {
    var results = [],
        counter = fns.length;
    return function(callback, errback) {
      fns.forEach(function (fn, i) {
        fn(function (result) {
          results[i] = result;
          counter--;
          if (counter <= 0) {
            callback.apply(null, results);
          }
        }, errback);
      });
    }
  }
};

module.exports = Do;