Title: Getting Started with Express
Author: TJ Holowaychuk
Date: Sat, 11 Sep 2010 22:55:36 GMT
Node: v0.2.1

This was the second in a series of posts leading up to
[Node.js Knockout][] on how to use [node.js][]. This post was
written by guest author and [Node.js Knockout judge][]
[Tj Holowaychuk][] and is
[cross-posted on his blog][].

In this short tutorial for [Node Knockout][] we will be creating a
small application using the popular [Express][] framework.

Express is a light-weight [Sinatra][]-inspired web development
framework. Express provides several great features such as an
intuitive view system, robust routing, an executable for generating
applications and much more.

## Installation

To get started with Express we first have to install it. There are
several ways to do so, however my personal favourite is the
following command which does not require a node package management
system:

    $ curl http://expressjs.com/install.sh | sh

Alternatively if we have [npm][] installed we can simply execute:

    $ npm install express

## First Express Application

To create our first application we could use *express(1)* to
generate an app for us, however an Express app *can* be a single
JavaScript file if we wish, and in our case of a simple “Hello
World” app that is exactly what we will do.

The first thing we need to do is require express, and create an
app. The *app* variable shown below is an **express.Server**,
however by convention we typically refer to Express servers as
“apps”.

<getting-started-with-express/server.js#requires>

Our next task is to set up one or more routes. A route consists of
a path (string or regexp), callback function, and HTTP method. Our
hello world example calls *app.get()* which represents the HTTP
**GET** method, with the path “/”, representing our “root” page,
followed by the callback function.

<getting-started-with-express/server.js#routes>

Next we need our server to listen on a given port. Below we call
*listen()* which attempts to bind the server to port *3000* by
default, however this can be whatever you like, for example
*listen(80)*.

<getting-started-with-express/server.js#start>

We can execute the app simply by executing *node(1)* against our
JavaScript file:

    $ node server.js
    Express server started on port 3000

Finally to confirm everything is working as expected:

    $ curl http://localhost:3000
    Hello World

## Middleware

Behind the scenes the [Connect][] middleware framework developed by
myself ([TJ Holowaychuk][Tj Holowaychuk]) and [Tim Caswell][] is
utilized to power the Express middleware. For example if we wish to
add logging support to our hello world application, we can add the
following line below *app = express.createServer();*:

    app.use(express.logger());

For more information on middleware usage view the [Middleware][]
section of the Express [Guide][].

## Source

Below is all *8* lines of source we used to create our first
Express application:

<getting-started-with-express/full-server.js>

  [Countdown to Knockout: Post 2 - Getting Started with Express]: http://nodeknockout.posterous.com/countdown-to-knockout-post-2-hello-world-with
  [Node.js Knockout]: http://nodeknockout.com/
  [node.js]: http://nodejs.org/
  [Node.js Knockout judge]: http://nodeknockout.com/judging#tj_holowaychuk
  [Tj Holowaychuk]: http://tjholowaychuk.com
  [Tim Caswell]: http://creationix.com
  [cross-posted on his blog]: http://tjholowaychuk.com/post/937557927/getting-started-with-express
  [Node Knockout]: http://nodeknockout.com
  [Express]: http://expressjs.com
  [Sinatra]: http://sinatrarb.com
  [npm]: http://github.com/isaacs/npm
  [Connect]: http://github.com/senchalabs/connect
  [Middleware]: http://expressjs.com/guide.html#Middleware
  [Guide]: http://expressjs.com/guide.html