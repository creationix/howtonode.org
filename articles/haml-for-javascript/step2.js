var Haml = require('haml'),
    fs = require('fs');

var layoutHaml = fs.readFileSync('layout.haml', 'utf8');
var usersHaml = fs.readFileSync('users.haml', 'utf8');

var data = {
  users: ["Tim", "Sally", "George", "James"]
};
var page_data = {
  title: "System Users",
  contents: Haml.render(usersHaml, {locals: data})
};
var html = Haml.render(layoutHaml, {locals: page_data});

console.log(html);