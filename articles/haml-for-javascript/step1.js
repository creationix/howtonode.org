var Haml = require('haml'),
    fs = require('fs');

var haml = fs.readFileSync('layout.haml', 'utf8');

var data = {
  title: "Hello Node",
  contents: "<h1>Hello World</h1>"
};

console.log(Haml.render(haml, {locals: data}));
