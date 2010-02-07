var Haml = require('haml'),
    File = require('file'),
    sys = require('sys');

File.read('layout.haml').addCallback(function (layout_haml) {
  File.read('users.haml').addCallback(function (users_haml) {
    var data = {
      users: ["Tim", "Sally", "George", "James"]
    };
    var page_data = {
      title: "System Users",
      contents: Haml.render(users_haml, {locals: data})
    };
    var html = Haml.render(layout_haml, {locals: page_data});
    sys.puts(html);
  });
});
