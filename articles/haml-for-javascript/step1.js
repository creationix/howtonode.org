var Haml = require('haml'),
    File = require('file'),
    sys = require('sys');

File.read('layout.haml').addCallback(function (haml) {
  var data = {
    title: "Hello Node",
    contents: "<h1>Hello World</h1>"
  };
  var html = Haml.render(haml, {locals: data});
  sys.puts(html);
});
