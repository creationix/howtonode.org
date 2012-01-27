Title: Testing Private State and Mocking Dependencies
Author: Vojta Jina
Date: Sun Jan 08 2012 00:11:06 GMT-0800 (PST)
Node: v0.6.5


During Christmas I’ve been working on [SlimJim] and found some tricks how to make my testing life
easier. It’s nothing special at all, just a simple way **how to access private state of a module**
and **how to mock out some dependencies**. I’ve found these two techniques pretty usefull, so I
believe it might help someone else as well...



### Why would you need to access private state of a module?

Private should be private, right? Yes, for sure. But during unit tests, it can be very helpful to
have access to private state of a module - I always try to cover functionality or bug at the lowest
possible level, because it’s simply cheaper:

- faster test execution
- less code is required to bootstrap the test

Let’s say we are building very simple static web server, the skeleton might look something like
this:

	var http = require('http');

	var handleRequest = function(request, response) {
	  // read file from fs and send response
	};

	exports.createServer = function() {
	  return http.createServer(handleRequest);
	};

This module has only one public method `createServer`, so unless we make it public, we can’t get
hold of anything else but this method. That sucks, because `HttpServer` doesn’t have any public
method to call the handler, so we would have to send some data through socket to test it. That’s way
too much effort, especially when you realize that the only code we really need to test is the
`handleRequest` function—everything else is just Node and we trust Node, because it’s awesome. We
need to test **our** code—that’s where all the bugs are.



### Why would you need to mock out dependencies?

Some dependencies are cheap, some not. When our code uses modules like `util` or `path`, we are
fine. Nothing bad happens there. But when it comes to some other modules like `fs`, `net` or `http`,
it’s totally different story. We simply don’t want to deal with real filesystem in unit tests. There
are many reasons for that, such as:

- accessing file system is slow
- it requires seting up some state of filesystem
- there is only one instance of filesystem, so conflicts between different unit tests might happen

So we want our module to use something different—we call these objects test doubles (I actually
like using mock/stub/dummy definition from [G.Meszaros]). The question is, how can we persuade our
awesome module, to use **a different instance during testing and different instance in production**?

**Dependency Injection** is great for this—it wires all the pieces together (yep, it saves us lot
of work)—and more than that, it does allow us to use different instances during testing. Yep, DI is
just awesome! I actually think, that new languages such as [Dart] should support DI natively—in the
same way as they do support memory management.

Unfortunately, there is no DI in Node, at least I haven’t found any sufficient implementation.
Writing a Dependency Injection framework is definitely a solution, but I was looking for something
faster...



## Let’s do it !


### Module Loader

<testing-private-state-and-mocking-deps/module-loader.js>

**This is actually the code this post is all about :-D**

Instead of using Node’s `require`, we use `loadModule` function, which reads the content of
requested module (javascript source file) and executes it on the `context` object. So all the
private state of the module is dumped into the `context` object and yay, we can access everything!
See [vm.runInNewContext] for more info.

Inside this `context` object, we defined our own `require` function, which means whenever the module
asks for a dependency, our `loadModule` will be called intead of Node’s `require`. That’s pretty
cool, because **we can decide, whether we want to return a mock or real module**, in which case we
delegate the request to Node’s `require`.


### Very simple web server example

<testing-private-state-and-mocking-deps/web-server.js>


### Let’s use it in test now

<testing-private-state-and-mocking-deps/web-server.test.js>

This is very simple example of unit testing `web-server` module, using `loadModule` function.

We can access both private functions as properties of `module` now, which is great, because we can
add more tests very easily. For example, you might have noticed, that `extensionFromUrl` won’t
return correct extension when requested url contains query param. Piece of cake, just add a test
that covers this bug:

	it('extensionFromUrl() should ignore query params', function() {
	  expect(module.extensionFromUrl('/some.html?param=ignored')).toBe('html');
	});

The second test only asserts whether we set proper status code for existing file. We should assert
status code for non existing file as well as caching headers, content type header and many other
stuff. The important point here is, that **it’s fast, because it doesn’t touch the real filesystem
and still does test what needs to be tested—our code**.


[SlimJim]: http://github.com/vojtajina/slim-jim/
[G.Meszaros]: http://xunitpatterns.com/Test%20Double.html
[vm.runInNewContext]: http://nodejs.org/docs/latest/api/vm.html#vm.runInNewContext
[Dart]: http://www.dartlang.org/
