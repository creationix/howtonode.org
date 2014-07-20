Title: Road - a route helper for Express
Author: Kishore Nallan
Date: Fri Apr 06 2012 19:07:00 GMT
Node: v0.6.8

I love [Express](http://expressjs.com), and it has been my preferred web framework for quite some time. It's fast, extremely flexible and light-weight. I like to structure my apps using the Model-View-Controller paradigm, and since Express does not directly impose a MVC convention, I felt the need for a small helper that maps the routes, controllers and views automatically using logical conventions. 

## The motivation

For small applications, you can mostly get away with a single `app.js` file containing your entire application logic.

	var app = require('express').createServer();

	app.get('/', function(req, res){
	  res.send('Application root!');
	});

	app.get('/foo', function(req, res){
	  res.send('Foo!');
	});

	app.listen(3000);

However, as your application grows, you will have to split-up your `app.js` file into multiple independent route modules. There are a few ways to do this. One way would be:
	
	// post.js
	module.exports = function(app){
	    app.get('/post/edit', function(req, res){
	        res.render('post/edit.ejs', {
            	title: 'Express Login'
        	});
	    });

    	// other post routes
	}
	
	// user.js
	module.exports = function(app){
	    app.get('/user/edit', function(req, res){
	        // do something
	    });

    	// other user routes
	}

	// in app.js
	require('./post')(app);
	require('./user')(app);

The above approach is fine, except that it makes me repeat myself many times (not DRY). Apart from having to repeat the top level route (e.g. `/post`) multiple times, I also have to manually map my route handler to the view file (e.g. `post/edit.ejs`) location. So, I wrote a helper which (amongst other things) mounts routes and serves views based on certain convetions, thereby reducing boilerplate.

## Introducing Road, a router helper for Express

Road expects you to follow certain simple conventions, and by doing so, it will take care of linking the routes with the correct controller methods. Firstly, you have to place your controllers into the `/controllers` directory in your application root. Similarly, the view files will reside inside the `/views` directory. Each controller gets its own sub-directory inside `/views`. Let's take a simple project set-up as an example:

	applicationRoot
	|--app.js
	|
	|--controllers
	|	|--studentsController.js
	|	
	|--views
	|	|--students
	|	|  |--show.ejs
	|	|  |--edit.ejs


As shown above, if you have a `studentsController`, all view files related to that controller will be placed in the directory `views/students`. That's about it! Let's now extend the above example to see how we can build applications rapidly using Road and Express 2.5.x.

## Quick start

First, install Road via NPM:

	npm install road

Integrating Road with your Express application is really simple. Once you structure your application in the above manner, tell Express to let Road handle the routing this way:

	// app.js
	var app = require('express').createServer(),
		road = require('road');

	// mount application routes using road
	app.use(express.router(road));

	// other Express/Connect middleware

Road comes with sensible defaults (we will get to the configuration options in a bit). The default routing rule is:

	/:controller?/:id?/:action?

What does that mean? Let's say you have a `get_edit()` method in your `studentsController`. When you do a `GET` request for `/students/12/edit`, Road will automatically invoke the `get_edit()` method in the controller:

	// studentsController.js
	this.get_edit = function(req, res, callback) {
		// this method will be invoked when you do: GET `/students/12/edit`
	}

The `id` can be accessed as `req.params.id`, just as you would do in Express.

## Controller methods

As shown above, a controller method directly maps to a `controllerName/methodName` route. What this means is that we don't need to specify our routes over and over again! Every controller method is prefixed with the HTTP method it's handling. So, if we wanted to support a `POST` request on the same URL, we do:

	// studentsController.js
	this.post_edit = function(req, res, callback) {
		// this method will be invoked when you do: POST `/students/12/edit`
	}

Controllers can have a `get_index()` method, which gets called when you omit the `action` part from the URL. For example, if you just hit `/students/` URL, this will call the `get_index()` method of the `students` controller. Similarly, Road also allows you to define a `indexController` which gets invoked when you directly hit the application root `/` without specifying a controller name.

As you might have noticed, a controller method is very similar to a typical Express route handler, except for the presence of a third parameter - `callback`. 

## The callback parameter

Instead of using `res.render()` and `res.send()` to render your views, you can use the controller method's `callback` parameter, which provides you with many useful shortcuts. Let's see some examples.

### Serving a view, along with view data

	// studentsController.js
	this.get_edit = function(req, res, callback) {
		callback(null, 'edit', {title: "Edit"});
	}

The `callback()` conforms to Node's convention of using the first argument for an error object. We will get to the error handling part later. For now - to render a view file, we can simply do:

	callback(null, 'edit', {title: "Edit"});

Road will now pick the view file `edit.ejs` from the `views/students` directory and render it by passing along the view data as well. If the view requires no data, simply ignore the third parameter.

### Serving a view with a custom content type

Sometimes, you might want to serve a file as a raw text file. To specify a response content type, simply provide a fourth parameter (default is `text/html`):

	callback(null, 'edit', {title:'Edit'}, 'text/plain');

### Serving JSON

For serving JSON output (perhaps for an AJAX request), do:

	var jsonObject = {'username': 'jack'};
    
	// response served with content type application/json
    callback(null, {'json': jsonObject});

### Redirects

Road also makes redirecting requests easy:

	// 302 redirect
	callback(null, {'redirect': '/foo/redirectTarget'});

	// 301 redirect
	callback(null, {'redirect': '/foo/redirectTarget'}, 301);

## Registering a callback for handling errors

If you want to register a callback that Road will call when it's done rendering the view (or encounters an error), you can do so like this:

	// app.js
	function roadCallback(err, req, res, next) {
	    if(err) {
	    	// do something
	    }
	}
	
	// `roadCallback` is called by Road when it's done
	road.configure({callback: roadCallback});

Road sets a `status` property on the callback's `err` argument to indicate the type of error. This can be used for rendering an appropriate view with the correct HTTP status code. For missing controllers or controller methods, `err.status` is set to 404 (to indicate a missing resource).

Any other error passed to Road from a controller method is set to 500.
	
	// inside a controller
	this.get_show = function(req, res, callback) {
		// do something
		callback(new Error('Critical error.'));
	}

	// app.js
	function roadCallback(err, req, res, next) {
		// err.status === 500 when get_show() is called
	}

If the error object already has a `status` property (perhaps set upstream, or by the controller itself), Road does not override that.

## Custom routing

Road allows you to specify additional custom routes that do not conform with Road's default routing rule `/:controller?/:id?/:action?`. These custom routes take precedence over the default routing rule. To define custom routes, create a `routes.js` file in the application's root directory this way:

	// routes.js
	module.exports = [
	    
	    ['get', '/path/to/foo/:id', 'foo', 'show'],
	    ['post, '/path/to/bar/:id', 'bar', 'edit']

	];

The above route definition tells Road to route a GET request for `/path/to/foo/34` to the `get_show()` method of the `fooController`. The value `34` will be available (as usual) in `req.params.id` inside the controller method. Once we have defined the custom routes, we hook it up with Road this way:

	// configure road with an options object
	road.configure({routes: require('./routes')});

	// now, mount the routes using road
	app.use(express.router(road));

##Content negotation

Road provides basic support for content negotiation. If a particular URL is called with an extension (like `something.json`), the `req.format` property is set to the value of the extension (which in this case, `json`). Based on this, we can serve different content:

	this.get_contentNegotiation = function(req, res, callback) {
		var names = ['Jack', 'Jane'];
		switch(req.format) {
			case 'json':
				callback(null, {'json': names});
				break;
			case 'html':
				var html = '<strong>Jack, Jane</strong>';
				callback(null, {'text/html': html});
				break;
			default:
				callback(new Error('Unsupported content type.'));
		}
	};


If the URL is not called with any extension, `req.format` is by default set to `html`.

## Other configuration options

There are other preferences that can be passed to Road as part of the options object:
	
* `viewEngine`: view engine to be used for rendering the views (e.g. ejs, jade). Default: `ejs`
* `useLayout`: specifies whether Express should use a layout while rendering the view. Default: `false`

See the [example application](https://github.com/kishorenc/road/tree/master/example) if you want to see more samples.

## What do you think?

[Road is up on GitHub](https://github.com/kishorenc/road). Please let me know your thoughts in the comments. Pull requests are also most welcome :)