// app.js

var meryl = require('meryl'),
  qs = require('querystring');
  staticfile = meryl.findp('staticfile'),
  microtemplate = meryl.findx('microtemplate');

var twinkles =  ['This is my freaking first wink', 'Hey tweeting sucks, lets twinkle'];

meryl.x('render', microtemplate());

meryl.x('redirect', function(loc) {
  this.status = 301;
  this.headers['Location'] = loc;
  this.send();
});

meryl.x('decodeSimplePostData', function(postdata) {
  if(typeof postdata != 'string')
    return qs.parse(postdata.toString());
  return qs.parse(postdata);
});

meryl.p('GET /static/<filepath>', staticfile());

meryl.h('GET /', function() {
  this.render('index', {twinkles: twinkles});
});

meryl.h('POST /newtweet', function() {
  var data = this.decodeSimplePostData(this.postdata);
  if(data.wink) {
    twinkles.push(data.wink);
   }
  this.redirect('/');
});

require('http').createServer(meryl.cgi()).listen(3000);

