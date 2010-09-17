// app.js

var meryl = require('meryl'),
  staticfile = meryl.findp('staticfile'),
  microtemplate = meryl.findx('microtemplate');

var twinkles = ['This is my freaking first wink', 'Hey tweeting sucks, lets twinkle'];

meryl.x('render', microtemplate());

meryl.p('GET /static/<filepath>', staticfile());

meryl.h('GET /', function() {
  this.render('index', {twinkles: twinkles});
});

require('http').createServer(meryl.cgi()).listen(3000);