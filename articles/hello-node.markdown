Title: Hello Node!
Author: Tim Caswell
Date: Mon Mar 22 2010 10:55:41 GMT-0500 (CDT)
Node: v0.1.102

In programming literature it has become the standard to create a hello world program as the first example.  This article will go through a few simple hello world type examples with everything from simple terminal output to an http server that uses an external framework for some semantic sugar.

Then we'll shift gears and go through a real example that teaches enough to get you up on your feet writing your own web application using node.JS.

## Hello World Examples

Here are four simple hello world examples. The comments in the code explain how the code works and the text around it explain what it does and how to test it.

## Hello Console

This example is about as plain as it can get. It prints the words "Hello World" to the terminal.

<hello-node/hello-console.js*>

You can run this by putting it in a file called "hello-console.js" and running it with `node hello-console.js`

## Hello HTTP

I'd guess that while it's not the only use case for node.JS, most people are using it as a web application platform.  So the next example will be a simple HTTP server that responds to every request with the plain text message "Hello World"

<hello-node/hello-http.js>

## Hello TCP

Node also makes an excellent TCP server, and here is an example that responds to all TCP connections with the message "Hello World" and then closes the connection.

<hello-node/hello-tcp.js>

## Hello Router

Often you won't be using the node built-in libraries because they are designed to be very low level.  This makes node quick, nimble, and easy to maintain, but is usually not enough to get started on a real world application.  My first node framework is `node-router`.  This example shows an HTTP server that responds with "Hello World" to all requests to "/" and responds with a 404 error to everything else.

<hello-node/hello-router.js>

In order to test this, you will need to install the `node-router` library.  There are two ways to do this.  You can either install it into a path that node recognizes (I create a symlink into ~/.node_libraries) or put the `node-router.js` file in your application and reference it locally.  See the [node docs on modules][] for more details on how modules work.

# Installing Libraries

I'll install the following libraries that are common to my projects:

 - [node-router][] - Wraps the built-in http library with many convenience functions like request routing and message body decoding.
 - [haml-js][] - Template engine that compiles HAML templates into HTML
 - [proto][] - Baby library that adds some useful stuff to Object.prototype

You can install these however you please, but here is how I'd do it.  The following code will clone the four libraries and install them into your local node library search path:

<hello-node/install.sh>

That's it for now, this article was going to explain more, but it seems it got lost and fell through the cracks.  Hopefully this will help you get started working with node.JS, it's a blast!.

[proto]: http://github.com/creationix/proto
[node docs on modules]: http://nodejs.org/api.html#_modules
[node-router]: http://github.com/creationix/node-router
[haml-js]: http://github.com/creationix/haml-js
[less.js]: http://github.com/cloudhead/less.js
