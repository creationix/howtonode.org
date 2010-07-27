var Haml = require('haml'),
    fs = require('fs');

//setup
var template_names = ["layout", "link", "links"];
var counter = template_names.length;
var templates = {};
template_names.forEach(function (name) {
  fs.readFile(name + ".haml", 'utf8', function (err, text) {
    if (err) throw err;
    templates[name] = Haml.compile(text);
    counter--;
    if (counter <= 0) {
      render_page();
    }
  });
});
//render
function render(name, locals) {
  return Haml.execute(templates[name], null, locals);
}
//renderpage
function render_page() {
  var html = render("layout", {
    title: "Links",
    contents: render("links", {
      partial: render,
      links: require('./data')
    })
  });
  console.log(html);
}

