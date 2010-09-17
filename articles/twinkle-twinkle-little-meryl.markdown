Title: Twinkle Twinkle Little Meryl
Author: Kadir Pekel
Date: Wed Sep 14 2010 22:26:51 GMT+0200 (CST)
Node: v0.1.102

This article will get you into the little world of Meryl, which is a minimalist
web framework built on nodejs. With its small sized code base, it is very simple
to use, fun to play and easy to modify. Unlike other full-stack web frameworks,
Meryl tries to keep some core features minimal and powerful and leave the rest
for you. With about 140 lines of core code Meryl implements some basic
fundamentals of web application building blocks while letting users to build
their own web applications as flexible as it could. Please visit
[Meryl homepage](http://coffeemate.github.com/meryl) for more details.

## Getting feet wet

First installation you can either use [npm](http://github.com/isaacs/npm) or
some other manual methods.

For npm installation, simply type:

	> npm install meryl

Through various manual installation methods you may choose cloning project
repository of Meryl via git under ./node_libraries directory. Since Meryl has no
dependencies, it's enough cloning only itself from
[github](http://github.com/coffeemate/meryl).

	> cd .node_libraries
	> git clone "http://github.com/coffeemate/meryl.git"

Yep, it's done. You can now use Meryl in your applications by simply typing
'require("meryl")'. As a startup, please check out our first example below.
Here is the first bits for Meryl.

	// app.js 
	
	// import meryl
	var meryl = require('meryl');

	// Now define a request handler tied to an url expression.
	meryl.h('GET /', function () { this.send('<h3>Hello, World!</h3>'); });

	// OK, here we go. Let's plug meryl into your http server instance.
	require('http').createServer(meryl.cgi()).listen(3000);

Later you create a file with an arbitrary name (conventionally 'app.js') with
the contents above, run it with node:

	> node app.js

Now point your http client to address
[http://localhost:3000](http://localhost:3000) to see the expected output. If it
is done, congrats, you've just greet Meryl!

## So What

If you have succeed running, we're ready to dive deeper. Meryl has some nice
features worth mentioning before we go.

It has:

* Robust request handling with regex based but Meryl flavored routing
expressions.
* Middleware infrastructure via plugins.
* Flexible simple minded extension system for add-ons.

Yes, these small amount of features denotes the fundamental concept of Meryl
clearly. It has three main parts; handlers, plugins and extensions. Handlers
serves the actual response to the http client, plugins process the incoming
requests just before any handler matches and extensions add new features to the
Meryl context which is a shared object between through plugins and handlers.

Let's look at the graphic below which will tell us the infrastructure of Meryl
more understandably.

<img src="/twinkle-twinkle-little-meryl/meryl.png" style="float:none;" />

Although the core of Meryl consists of only these three parts, they help
developing plenty of requirements for almost every kind of web application.
So if you understand these building blocks, Meryl can serve you as a swiss-army
knife for all your various scale (probably not too large) startups. For the sake
of not stretching the topic too much, you can go for Meryl's
[homepage](http://coffeemate.github.com/meryl) to browse more detailed
documentation.

## Twinkler

Now, i want to continue this article with a complete feature covered tutorial to
demonstrate the minimalist approach of Meryl to the web application development
as a framework. We will walk through a simple tutorial, which is a very very
stripped down version of Twitter named 'Twinkler'. It will be a dead simple code
but demonstrate almost all features of Meryl. You can find the actual code under
[examples/twinkler](http://github.com/coffeemate/meryl/tree/master/examples/twinkler/)
directory of project tree. 

<img src="/twinkle-twinkle-little-meryl/sc.png" style="float:none;" />

First of I'm going to create a skeleton for our brand new product. At first i
want to serve some static content such images and css files, so we are so lucky
that we have a built-in static file handler plugin which does the job for us. We
can use 'meryl.findp' for importing any plugin and 'meryl.findx' for extensions
vice versa. Below we'll call our built-in static file handler using
'meryl.findp'.

	// app.js 
	
	// import meryl
	var meryl = require('../../index');
	// import built-in static file plugin
	var staticfile = meryl.findp('staticfile');

	// register our plugin mapping the 'static' virtual
	// path for static content
	
	// options we're passing to staticfile function are default already but
	// demonstrated here for clarification.
	
	// root param denotes the root path for static content on file system
	// path param denotes the url expression paramter which to lookup file under root
	meryl.p('GET /static/<filepath>', staticfile({root: 'public', path: 'filepath'}));
	

	// of course plug meryl
	require('http').createServer(meryl.cgi()).listen(3000);

If you run this code you' ll get a simple and fresh static file server. With a
directory structure like below, you can make requests for contents under
'public' directory such requesting an address like
[http://localhost:3000/static/content.ext](http://localhost:3000/static/content.ext)

	twinkler/
	|-- public
	|   |-- figure-1.png
	|   `-- common.css
	`-- app.js

Later we build some skeleton we are going to need a home page. Let's add it.

	// Map root url 'http://localhost:3000/' to respond some text
	meryl.h('GET /', function() {
	  this.send("Say Hello To Twinkler");
	});

If you make a request to address [http://localhost:3000](http://localhost:3000)
of course you' ll will greet Meryl. But, this method is fine unless we want to
serve some templates reside on filesystem. For the sake of making things easier
for designing frontend interfaces and layout structures, we must build a
templating system. Again our luck is that Meryl has a simple built-in template
engine based on [underscore.js](http://documentcloud.github.com/underscore/)'s
implementation of John Resig's
[micro templating algorithm](http://ejohn.org/blog/javascript-micro-templating).
Also for partial views for a layout system Meryl has added an nested templating
feature to this micro template implementation. In the end Meryl owned a rock
solid pure templating engine :)

Ok, let's take it short and show some code.

	var microtemplate = meryl.findx('microtemplate');
	
We import the built-in extension by 'meryl.findx' and use is by 'meryl.x' to
extend Meryl context object like below.

	meryl.x('render', microtemplate({templateDir: 'templates', templateExt: 'jshtml'}));

Extending context is a simple matter of setting key-value pair for it. So above
we define a function named 'render' which points to our ready-to-use extension.
So you can use it everywhere you access the context. See below.

	meryl.h('GET /', function() {
	  this.render('index', {foo: 'bar'});
	});

The function reference 'render' takes two parameters. The first one denotes the
name of template's file name without any extension under the directory
previously pointed by 'templateDir' parameter. The second one forms the
templating data wich is the context of template rendering process. If we
reorganize our directory structure such below you can start rendering anyt
template located under 'templates' directory.

	twinkler/
	|-- public
	|   |-- figure-1.png
	|   `-- common.css
	|-- templates
	|   `-- index.jshtml
	`-- app.js
	
Also here is a sample content for a template.

	<!-- index.jshtml -->
	<div>
	  <%= foo %>
	</div>

if you make a new request [http://localhost:3000](http://localhost:3000) you
must see 'bar' for the returned result.

For nested layouts we can use 'template' function in any template. See below.

	<!-- index.jshtml -->
	<div>
		<%= template('subpage', {baz: 'zen'})
	  <%= foo %>
	</div>
	
	<!-- subpage.jshtml -->
	<div>
	  <%= baz %>
	</div>
	
To sum up, that we've come up we should have a code like shown below with some
modifications. (See
[examples/twinkler](http://github.com/coffeemate/meryl/tree/master/examples/twinkler/)
)

	twinkler/
	|-- public
	|   |-- images/wink.jpg
	|   `-- css/styles.css
	|-- templates
	|   |-- wink.jshtml
	|   |-- header.jshtml
	|   |-- footer.jshtml
	|   `-- index.jshtml
	`-- app.js

--

	// app.js
	
	var meryl = require('../../index'),
	  staticfile = meryl.findp('staticfile'),
	  microtemplate = meryl.findx('microtemplate');

	var twinkles = ['This is my freaking first wink', 'Hey tweeting sucks, lets twinkle'];

	meryl.x('render', microtemplate());

	meryl.p('GET /static/<filepath>', staticfile());

	meryl.h('GET /', function() {
	  this.render('index', {twinkles: twinkles});
	});
	
	require('http').createServer(meryl.cgi()).listen(3000);

After all, we have to write some code to insert new winks into our existing
winks. So writing another handler for handling a post datas from a html form
will solve our problem. So add below,

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

	meryl.h('POST /newtweet', function() {
	  var data = this.decodeSimplePostData(this.postdata);
	  if(data.wink) {
	    twinkles.push(data.wink);
	   }
	  this.redirect('/');
	});
	

As you see we have defined some more extension. It's real easy to add one.
Unfortunately  Meryl has a long way and restrcited amoutn of time to implemet
such fundemental plugins adn extensions. Don't forget to help Meryl by
contributing to it.

## Sum up

Finally we are done writing up a simple twitter like service. Here is the final code.

	var meryl = require('../../index'),
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


So far, we are ok for now. Please don't stop here. Go play with Meryl, modify
it, contribute it. At least enjoy with it. It needs your help every time.

Also don't forget to checkout the other
[examples](http://github.com/coffeemate/meryl/tree/master/examples).

See you next time, hopefully next article.

