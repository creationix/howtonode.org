Title: Welcome to HowToNode.org
Author: Tim Caswell
Date: Tue Feb 02 2010 10:16:51 GMT-0600 (CST)

**How To Node** is a blog featuring projects and tutorials relating to the Node.js project.

This article will describe how the blog works.  Teach a few node concepts and describe how to contribute new articles for others to enjoy.

## Sample App - The node-blog engine. ##

This entire site is hosted by an nginx server as static html files.  That's right, you can hit refresh as many times as you want and my node code won't know about it.  Think about it as super page caching.

So where does node come in?  Well there is a small node app running on a high port listening for POST hooks from github.  Every time someone pushes changes to the repository that represents the source of this site, the running node app will regenerate all the static files.

For full source-code to the engine please reference the [node-blog][] page at github.

For the source to the articles and actual content, see the repository for [howtonode.org][]

### Node is different ###

Something you'll notice coming from other languages (especially PHP) is that [node][] doesn't assume your code is running *in* a web-server.  In fact it doesn't assume much at all.  This turns out to be a very good thing and we'll see why later.

Also something that will be new is the fact that **all** IO functions are non-blocking and asynchronous.  This allows node to be single threaded at the application layer, but perform very well. Especially for use cases where time is speant in IO wait.

### HTTP Server - Github Hook ###

First we need a running http server to listen to POST hooks from [github][].  This is pretty simple in [node][] and requires that we run a small http server.

We'll start with a small HTTP server.  Almost straight from the docs.

    var sys = require('sys'),
       http = require('http');

    http.createServer(function (req, res) {
      setTimeout(function () {
        res.sendHeader(200, {'Content-Type': 'text/plain'});
        res.sendBody('Hello World');
        res.finish();
      }, 2000);
    }).listen(8000);

    sys.puts('Server running at http://127.0.0.1:8000/');

First we're loading a couple of external libraries.  Node is partially compatible with the CommonJS securable module system.  This means that library developers can write reusable JavaScript code and you can `require` it into your project.  The two we're loading here are [sys][] and [http][]. Loading `sys` allows us to do several low-level operations like write to the terminal and execute shell commands.  Loading `http` allows us to start a standalone HTTP server.

Bascically, this is the order of operations:

 - `sys` is loaded and all execution stops until it's done
 - Same for the `http` library.  `require` is about the only blocking method in node.
 - Then http.createServer is called and a function is passed to it.  It returns immediately
 - Listen is called on the resultant server and returns immediately.
 - sys.puts is called.  This is also async, so we don't wait for the text to actually appear on the console.

Now what happens next starts to get tricky.  Node runs in a single thread of execution, but as soon as a block of synchronous code is done, the event loop runs the next event in the queue.  So what happens next depends on which IO was ready first.  Practically `listen` and `puts` both happen pretty quickly, so it doesn't usually matter. Se we'll assume that a message got printed to the console and an HTTP server is running port 8000.

Whenever the server gets a web request, the function we passed in to createServer gets called.  The two arguments `req` and `res` stand for request and response.  Our function will also return right away since none of our function are blocking, so we need these handles to reference the http request later on.  In the example the timeout will be scheduled and the function will end.  Later after the timeout has finished, the function inside it will be executed.  Now, with `res` in our closure, we send a response to the waiting web browser and close the connection.  Note that we could sleep for 30 seconds and the HTTP server would still be accepting new connections from other clients.  This is the beauty of non-blocking IO.

So to convert this to a Github POST hook, we'll keep it simple and assume all the logic is in another module.

    var sys = require('sys'),
       http = require('http'),
       build = require('./builder').rebuild;

    http.createServer(function (req, res) {
      rebuild(function (output) {
        res.sendHeader(200, {'Content-Type': 'text/plain'});
        res.sendBody(output);
        res.finish();
      })
    }).listen(8000);

    sys.puts('Github hook running at http://127.0.0.1:8000/');

So whenever a request is received, we call the external `rebuild` method.  The reason we pass in a callback instead of getting the return value is because the builder will need to do some of it's own IO and can't return a meaningful response right away.  When it's done, we'll be notified and then pass on the output to the browser.

### Parallel IO - File Processor ###

**TODO**: explain how node-blog processes the source files in parallel.

## Contributing ##

**TODO**: Write how to contribute articles.

[sys]: http://nodejs.org/api.html#_system_module
[http]: http://nodejs.org/api.html#_http
[node]: http://nodejs.org/
[github]: http://github.com/
[node-blog]: http://github.com/creationix/node-blog
[howtonode.org]: http://github.com/creationix/howtonode.org