var fs = require('fs');

// Here is the sync version:
function loaddirSync(path) {
 return fs.readdirSync(path).filter(function (filename) {
   return fs.statSync(filename).isFile();
 }).map(function (filename) {
   return fs.readFileSync(filename);
 });
}

// And it's used like this
console.dir(loaddirSync(__dirname));
