var fs = require('fs');

fs.readdir("/usr", function (err, files) {
  if (err) throw err;
  console.log("/usr files: " + files);
});
