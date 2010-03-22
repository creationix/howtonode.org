Title: Hello Node!
Author: Tim Caswell
Date: Mon Mar 22 2010 10:55:41 GMT-0500 (CDT)
NodeVersion: v0.1.33-143-gaa0f994

In programming literature it has become the standard to create a hello world program as the first example.  This article will go through a few simple hello world type examples with everything from simple terminal output to an http server that uses an external framework for some semantic sugar.

Then we'll shift gears and go through a real example that teaches enough to get you up on your feet writing your own web application using node.JS.

# Hello World Examples

Here are four simple hello world examples.

## Hello Console

This example is about as plain as it can get. It prints the words "Hello World" to the terminal.

    // Load the sys module since we want to write to the terminal
    var sys = require('sys');

    // Call the puts function on the sys module.
    sys.puts("Hello World");

You can run this by putting it in a file called "hello-console.js" and running it with `node hello-console.js`

## Hello HTTP

I'd guess that while it's not the only use case for node.JS, most people are using it as a web application platform.  So the next example will be a simple HTTP server that responds to every request with the plain text message "Hello World"

    // Load the sys module for console writing.
    var sys = require('sys');
    // Load the http module to create an http server.
    var http = require('http');

    // Configure our HTTP server to respond with Hello World to all requests.
    var server = http.createServer(function (request, response) {
      response.writeHead(200, {"Content-Type": "text/plain"});
      response.write("Hello World\n");
      response.close();
    });

    // Listen on port 8000, IP defaults to 127.0.0.1
    server.listen(8000);

    // Put a friendly message on the terminal
    sys.puts("Server running at http://127.0.0.1:8000/");

## Hello TCP

Node also makes an excellent TCP server, and here is an example that responds to all TCP connections with the message "Hello World" and then closes the connection.

    // Load the sys module for console writing.
    var sys = require('sys');
    // Load the net module to create a tcp server.
    var net = require('net');

    // Setup a tcp server
    var server = net.createServer(function (socket) {
  
      // Every time someone connects, greet and then close the connection.
      socket.addListener("connect", function () {
        sys.puts("Connection from " + socket.remoteAddress);
        socket.write("Hello World\n");
        socket.close();
      });
  
    });

    // Fire up the server bound to port 7000 on localhost
    server.listen(7000, "localhost");

    // Put a friendly message on the terminal
    sys.puts("TCP server listening on port 7000 at localhost.");

## Hello Router

Often you won't be using the node built-in libraries because they are designed to be very low level.  This makes node quick, nimble, and easy to maintain, but is usually not enough to get started on a real world application.  My first node framework is `node-router`.  This example shows an HTTP server that responds with "Hello World" to all requests to "/" and responds with a 404 error to everything else.

    // Load the node-router library by creationix
    var server = require('node-router').getServer();

    // Configure our HTTP server to respond with Hello World the root request
    server.get("/", function (request, response) {
      response.simpleText(200, "Hello World!");
    });

    // Listen on port 8080 on localhost
    server.listen(8080, "localhost");

In order to test this, you will need to install the `node-router` library.  There are two ways to do this.  You can either install it into a path that node recognizes (I create a symlink into ~/.node_libraries) or put the `node-router.js` file in your application and reference it locally.  See the [node docs on modules][] for more details on how modules work.

[node docs on modules]: http://nodejs.org/api.html#_modules
