var meryl = require('meryl'),
  staticfile = meryl.findp('staticfile'),
  // import built-in micro templating extension
  microtemplate = meryl.findx('microtemplate');

var twinkles = ['This is my freaking first wink', 'Hey tweeting sucks, lets twinkle'];

// Use micro templating extension by mapping it as an
// attribute with an arbitrary name'render'
meryl.x('render', microtemplate());

meryl.p('GET /static/<filepath>', staticfile());

// Let's use the extension
meryl.h('GET /', function() {
  this.render('index', {twinkles: twinkles});
});

require('http').createServer(meryl.cgi()).listen(3000);