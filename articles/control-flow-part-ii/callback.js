var fs = require('fs');

fs.readFile('mydata.txt', function (err, buffer) {
  if (err) {
    // Handle error
    console.error(err.stack);
    return;
  }
  // Do something
  console.log(buffer);
});
