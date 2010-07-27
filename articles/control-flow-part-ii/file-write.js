var fs = require('./continuable-style-fs');

function fileWrite (filename, data) { return function (callback, errback) {
  fs.open(filename, "w", 0666)(function (fd) {
    var totalWritten = 0;
    function doWrite (_data) {
      fs.write(fd, _data, 0, 'utf8')(
        function (written) {
          totalWritten += written
          if (totalWritten === _data.length) {
            fs.close(fd);
            callback(totalWritten);
          } else {
            doWrite(_data.slice(totalWritten));
          }
        }, errback);
    }
    doWrite(data);
  }, errback);
}}

// Use it!
fileWrite('test', "Hello")(
  function (written) {
    console.log(written + " bytes successfully written");
  },
  function (err) {
    throw err;
  }
);