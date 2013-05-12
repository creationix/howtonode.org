Title: Understanding process.nextTick()
Author: Kishore Nallan
Date: Tue Jan 24 2012 19:07:00 GMT
Node: v0.6.8

I have seen quite a few people being confused about `process.nextTick()`. Let's take a look at what `process.nextTick()` does, and when to use it.

As you might already know, every Node application runs on a single thread. What this means is that **apart from I/O** - at any time, only one task/event is processed by Node's event loop. You can imagine this event loop to be a queue of callbacks that are processed by Node on every **tick** of the event loop. So, even if you are running Node on a multi-core machine, you will not get any parallelism in terms of actual processing - all events will be processed only one at a time. This is why Node is a great fit for I/O bound tasks, and definitely not for CPU intensive tasks. For every I/O bound task, you can simply define a callback that will get added to the event queue. The callback will fire when the I/O operation is done, and in the mean time, the application can continue to process other I/O bound requests. 

Given this model, what `process.nextTick()` actually does is defer the execution of an action till the next pass around the event loop. Let's take a simple example. If we had a function `foo()` which we wanted to invoke in the next tick, this is how we do it:

	function foo() {
	    console.error('foo');
	}
	
	process.nextTick(foo);
	console.error('bar');

If you ran the above snippet, you will notice that `bar` will be printed in your console before `foo`, as we have delayed the invokation of `foo()` till the next tick of the event loop:

	bar
	foo

In fact, you can get the same result by using `setTimeout()` this way:

	setTimeout(foo, 0);
	console.log('bar');

However, `process.nextTick()` is not just a simple alias to `setTimeout(fn, 0)` - it's [far more efficient](https://gist.github.com/1257394). 

Let's see where we can use `process.nextTick()`:

## Interleaving execution of a CPU intensive task with other events

Let's say we have a task `compute()` which needs to run almost continuously, and does some CPU intensive calculations. If we wanted to also handle other events, like serving HTTP requests in the same Node process, we can use `process.nextTick()` to interleave the execution of `compute()` with the processing of requests this way:

	var http = require('http');

	function compute() {
		// performs complicated calculations continuously
		// ...
		process.nextTick(compute);
	}

	http.createServer(function(req, res) {
 		res.writeHead(200, {'Content-Type': 'text/plain'});
 		res.end('Hello World');
	}).listen(5000, '127.0.0.1');

	compute();

In this model, instead of calling `compute()` recursively, we use `process.nextTick()` to delay the execution of `compute()` till the next tick of the event loop. By doing so, we ensure that if any other HTTP requests are queued in the event loop, they will be processed before the next time `compute()` gets invoked. If we had not used `process.nextTick()` and had simply called `compute()` recursively, the program would not have been able to process any incoming HTTP requests. Try it for yourself!

So, alas, we don't really get any magical multi-core parallelism benefits by using `process.nextTick()`, but we can still use it to share CPU usage between different parts of our application.

## Keeping callbacks truly asynchronous

When you are writing a function that takes a callback, you should always ensure that this callback is fired asynchronously. Let's look at an example **which violates** this convention:

	function asyncFake(data, callback) {		
		if(data === 'foo') callback(true);
		else callback(false);
	}

	asyncFake('bar', function(result) {
		// this callback is actually called synchronously!
	});


Why is this inconsistency bad? Let's consider this example taken from Node's [documentation](http://nodejs.org/docs/latest/api/net.html#net.createConnection):

	var client = net.connect(8124, function() { 
		console.log('client connected');
		client.write('world!\r\n');
	});

In the above case, if for some reason, `net.connect()` were to become synchronous, the callback would be called immediately, and hence the `client` variable will not be initialized when the it's accessed by the callback to write to the client! 

We can correct `asyncFake()` to be always asynchronous this way:

	function asyncReal(data, callback) {
		process.nextTick(function() {
			callback(data === 'foo');		
		});
	}

## When emitting events

Let's say you are writing a library that reads from a source and emits events that contains the chunks that are read. Such a library might look like this:
	
	var EventEmitter = require('events').EventEmitter;

	function StreamLibrary(resourceName) { 
		this.emit('start');
				
		// read from the file, and for every chunk read, do:		
		this.emit('data', chunkRead);		
	}
	StreamLibrary.prototype.__proto__ = EventEmitter.prototype;   // inherit from EventEmitter

Let's say that somewhere else, someone is listening to these events:

	var stream = new StreamLibrary('fooResource');

	stream.on('start', function() {
		console.log('Reading has started');
	});

	stream.on('data', function(chunk) {
		console.log('Received: ' + chunk);
	});

In the above example, the listener will never get the `start` event as that event would be emitted by `StreamLibrary` immediately during the constructor call. At that time, we have not yet assigned a callback to the `start` event yet. Therefore, we would never catch this event! Once again, we can use `process.nextTick()` to defer the `emit` till the listener has had the chance to listen for the event.

	
	function StreamLibrary(resourceName) { 		
		var self = this;
		
		process.nextTick(function() {
			self.emit('start');
		});
				
		// read from the file, and for every chunk read, do:		
		this.emit('data', chunkRead);		
	}
	
I hope that demystifies `process.nextTick()`. If I have missed out something, please do share in the comments.

