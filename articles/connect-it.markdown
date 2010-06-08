Title: Just Connect it Already
Author: Tim Caswell
Date: Mon Jun 07 2010 12:22:52 GMT-0700 (PDT)
Node: v0.1.97

Now that the core API's of node are really starting to stabilize, I'm moving my attention to helping stabilize the framework scene.  One of the things I found really neat from Ruby was the [Rack][] server interface.  It allowed any server that followed the spec to host any app that followed the spec.  Also (and this is the important part for node) is allowed for generic middleware libraries to do common tasks and functions in a very aspect oriented manner.

My employer, [Ext JS][], has sponsored [TJ Holowaychuk][] and I to write a middleware system for node called [Connect][] in an effort to foster common development in the node community.

## So What's New?

Actually there isn't a lot new here.  But then again, there was nothing new about node either.  Node uses non-blocking IO for fast scalable servers.  That's been known about for years among the C community.  It uses event based, single thread javascript for logic.  That's exactly what the browser has. Add these together and we all see the huge splash it's made.  It's the unique combination of some simple but complimentary ideas that really make these projects zing.

[Connect][] tries to abstract and repackage node as little as possible.  As a result, the API is fairly node specific, but there aren't a lot of leaky abstractions dripping all over the place.  It's fairly solid considering the short time it's been in development so far.  [Connect][] adds one new unique aspect to node's HTTP server and that's the idea of layers.

## The Integration Problem

In a normal node HTTP server you usually see code like this.

<connect-it/node-http.js>

And all requests will be served:

    HTTP/1.1 200 OK
    Content-Type: text/plain
    Connection: close
    Transfer-Encoding: Identity

    Hello Connect

This works great for when you want fast synthetic benchmarks or always want to return the same response for every HTTP request.  In most apps, however, this isn't the case.  You want some form on request routing.  Also you'll want nice enhancements like response body gzipping, smart caching, request logging, pretty error handlers, etc...

Implementing all these things over and over for each project is a royal pain since they are somewhat non-trivial and usually a project in and of themselves.  So ideally the node community has a collection of modules that we can use in common to solve these common tasks.  The only problem is that there is no accepted spec to follow.  All these libraries have their own style and way to integrate.  This is great for innovation, terrible for someone trying to just get work done and quickly.

## Layers to the Rescue

<img src="/connect-it/onion.jpg" style="float:right;margin: 0 0 10px 10px" />

So taking the ideas from [Rack][] and [ejsgi][], we introduce the idea of layers to the code handling the HTTP request and response.  An app is structured like an onion.  Every request enters the onion at the outside and traverses layer by layer till it hits something that handles it and generates a response.  In [Connect][] terms, these are called filters and providers.  Once a layer provides a response, the path happens in reverse.

The [Connect][] framework simply takes the initial `request` and `response` objects that come from node's http callback and pass then layer by layer to the configured middleware modules in an application.


The example from above, converted to a [Connect][] app looks as follows:

<connect-it/connect-http.js>

And request will output this:

    HTTP/1.1 200 OK
    Content-Type: text/plain
    Content-Length: 13
    Connection: close

    Hello Connect

## Walkthrough Writing Layers and an Application

Let's go through a simple app from the top down.  It will serve JavaScript files from a folder, cache the result in ram, and log the request and responses.  We'll implement our middleware layers from scratch to understand how they work.  There are better versions of these built-in.

<connect-it/app.js>

An app is just a call to `Connect.createServer` with an array of middleware config lines.

All Connect middlewares are simply node modules that export a `handle` function.  This function will be called by the connect engine when it gets to that layer of the application.  You have the option at this point to either: A) Serve a response using the `res` parameter. or B) Pass on control to the next layer in the chain using the `next` parameter.  Since you have raw access to the node request and response objects and the full JavaScript language, the possibilities are endless.

### Serve Some Files

Most apps will want to serve some static resources, so let's write a middleware that serves javascript files based on the request url.

<connect-it/serve-js.js>

Here we are using the built-in node library `'fs'` to read the requested file from the hard-drive.  Then we're using the Connect provided helper `simpleBody` on the http response object.  Nothing fancy or complicated here.

### Log It

Whenever there is a problem with a server, it's really great to have a log-file somewhere to trace what went wrong.  This log module will output a line when a request comes in through the layer, and then another on the way back out.

<connect-it/log-it.js>

Connect modules also support a `setup` function that get's called once on server startup.  This is a great place to setup variables used by the middleware.  In this case we're initializing the counter for the logger.

In `handle` we are using a wrapping idiom to hook into the call to `writeHead`.  In JavaScript functions are values just like anything else.  So a great way to wrap functions is to store a reference to the original implementation in a closure variable.  Replace the function with a new one, and in the first line of the new function, put the old function definition back.  Then on the last line of the replacement function call the original.  This is a simple and efficient way to hook into existing object methods since they just look for properties by name and not references to actual function objects.

The standalone `puts` call will be called at the beginning of each request cycle, and the nested `puts` will be called on the way out by means of the nested `writeHead` function.

## Built-in Middleware

Connect comes with several built-in middleware layers for easy use.  A much more robust version of this example could be written using the built-in modules.

<connect-it/app2.js>

This has proper error-handline, proper HTTP headers, and all sorts of other bells and whistles that are required from a production web server.

## Future and Goals of Connect

Connect is currently in alpha state. We're looking for community feedback and hope to stabilize into a beta in the next week or so.  

Also what's really needed is for some real frameworks and apps to be written using Connect as a base.  TJ is using it internally for a project at work and I plan to convert [wheat][] (The engine to this blog) to use it.

The true goal of Connect is to help the node community work better together.   Connect is the combined effort of some JavaScripters from the node community who want a base system to build world-class web frameworks from.

There has been a lot of discussion on the topic of middleware and now is the time to write some code, use it, and do it.  The popularity of JavaScript itself is proof that what really succeeds is real-world implementations, not substance-less discussions on the very best way to do something. Like node, our goal is to make something simple, but correct, and let others build from there.

### What you Should Do

Connect is cool, I gave two presentations on it in the past week at [txjs][] and [swdc][] and people loved it. TJ and I have done all we can for now and need some community feedback in order to move on.  If you are interested in node and want to help shape the future of web frameworks please do the following:

 - Install node if you haven't already. (I suggest using [nvm][])
 - Clone Connect.
 - Go through the examples in the code-base. (The `app.js` file is launched with the `connect` executable)
 - Write your own code using Connect. (Or port your favorite node framework)
 - Send feedback through [github][] and the normal node community channels. (irc and mailing list)
 - Tweet about it to spread the word. (This only works if everyone uses it)

[Connect]: http://github.com/extjs/Connect
[Ext JS]: http://extjs.com/
[TJ Holowaychuk]: http://github.com/visionmedia
[ejsgi]: http://github.com/isaacs/ejsgi
[rack]: http://rack.rubyforge.org/
[wheat]: http://github.com/creationix/wheat
[txjs]: http://www.slideshare.net/creationix/real-time-web-with-node
[swdc]: http://www.slideshare.net/creationix/node-powered-mobile
[nvm]: http://github.com/creationix/nvm
[github]: http://github.com/extjs/Connect/issues