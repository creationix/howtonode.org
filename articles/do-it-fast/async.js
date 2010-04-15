var fs = require('fs');
var sys = require('sys');

fs.readdir("/usr", function (err, files) {
  if (err) throw err;
  sys.puts("/usr files: " + files);
});
