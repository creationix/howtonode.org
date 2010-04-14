var fs = require('fs');
var sys = require('sys');

function execFile(path, callback) {
  var regex = /#(.+)$/;
  var filename = path;
  var match = regex.exec(path);
  var name;
  if (match) {
    name = match[1];
    filename = path.substr(0, match.index);
    sys.p(filename);
  }
  fs.readFile(filename, function (err, code) {
    if (err) { callback(err); return; }
    try {
      if (name) {
        var regex = new RegExp("\n//" + name + "\n((?:[^/]|/[^/]|//[^a-z])*)");
        code = code.match(regex)[1];
      }
      code = code.trim();
      sys.error("--\n"+code+"\n--")
      var result = process.evalcx(code, {}, path);
    } catch (err) { callback(err); return; }
    callback(null, result);
  });
}

execFile('prototypal.js#intro-to-style', function (err, result) {
  if (err) {
    throw err;
  }
  sys.p(result);
});
