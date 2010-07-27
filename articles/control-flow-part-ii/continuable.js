var fs = require('./continuable-style-fs');

fs.readFile('mydata.txt')(function (text) {
  // Do something
  console.log(text);
}, function (error) {
  // Handle error
  throw error
});
