var Haml = require('haml'),
    File = require('file'),
    sys = require('sys');

var template_names = ["layout", "link", "links"];
var counter = template_names.length;
var templates = {};
template_names.forEach(function (name) {
  File.read(name + ".haml").addCallback(function (text) {
    templates[name] = Haml.compile(text);
    counter--;
    if (counter <= 0) {
      render_page();
    }
  });
});

function render(name, locals) {
  return Haml.execute(templates[name], null, locals);
}

var links = [
  {name: "Google", link: "http://google.com/"},
  {name: "Github", link: "http://github.com/"},
  {name: "nodejs", link: "http://nodejs.org/"},
  {name: "HowToNode.org", link: "http://howtonode.org/"}
];

function render_page() {
  var html = render("layout", {
    title: "Links",
    contents: render("links", {
      partial: render,
      links: links
    })
  })
  sys.puts(html);
}



