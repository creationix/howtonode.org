Title: Node + Redis = Fun
Author: Nikhil Marathe
Date: Mon Sep 06 2010 12:48:20 GMT+530 (IST)
Node: v0.2.0

node brings asynchronous, evented I/O to the server. Redis gives you a blazing fast database with support for strings, lists and sets. Both Redis and Node.js follow certain patterns, Redis for data-storage, and node for event based programming. I hope to give an introduction to both in this article. By the time we are done, we will have built a [Pastebin][] service.

[Pastebin]: http://en.wikipedia.org/wiki/Pastebin

## Getting Started ##

I will assume that the reader is comfortable with Javascript, including using events and passing around functions.

Before we get down to the code, here is the software you will need:

* [node][] ( we will use [v0.2.0](http://github.com/ry/node/downloads) )
* [Redis][]
* [redis-node-client][] - to connect to Redis from node. Already bundled within snip.
* [nerve][] - A micro-framework to handle routing. Use the bundled version which works with node v0.1.91.
* [underscore.js][] - A collection of useful javascript functions, we will use only one.
* [Pygments][] - Python program to syntax highlight code.

[discussions]: http://groups.google.com/group/nodejs/msg/df199d233ff17efa
[node]: http://nodejs.org/
[Redis]: http://code.google.com/p/redis/
[redis-node-client]: http://github.com/fictorial/redis-node-client/
[nerve]: http://github.com/gjritter/nerve/
[Pygments]: http://pygments.org/
[underscore.js]: http://documentcloud.github.com/underscore/

Finally, here is how our code is organized.

    snip
    |- deps/
       |- redis-node-client/
       |- nerve/
       |- underscore.js
    |- run
    |- snip.js

## A note on the node module system ##

Node modules are used by importing them into the current scope using `require()`. The `NODE_PATH` environment variable is used to search for modules. When you have lots of dependencies, it gets boring to keep entering the full paths in the requires all the time. So rather than directly invoking

    node <script>

to test our application, we will be using this shell script, so that we can directly do

    require( 'nerve' ) 
  
and have it work 

    #!/usr/bin/env sh
    export SNIP_PATH=$(dirname `readlink -f $0`)

    export NODE_PATH=\
    $NODE_PATH\
    :$SNIP_PATH\
    :$SNIP_PATH/deps/redis-node-client/lib\
    :$SNIP_PATH/deps/nerve/lib\
    :$SNIP_PATH/deps/ #underscore.js

    node "$@"

## The Big Picture ##

Here is how our application works

1. You visit the http://localhost:8000/
2. Post your code snippet, and choose the language
3. Get a unique url http://localhost:8000/`id`

## Database Schema ##

_See the [full list of Redis commands](http://code.google.com/p/redis/wiki/CommandReference). redis-node-client will abstract the actual communication._

So how do we represent our data ( snippets ) so that we can do all the things we want to do?

Relational databases have rows and columns, where columns identify various parts of the data. But key-value stores, including Redis, don't have that. The solution is to encode the column in the key itself. So for each snippet we will have a key snippet:`id`. So how do we prevent two snippets from having the same `id`? In MySQL you would probably set the `id` column of the `snippets` table to `PRIMARY KEY AUTO_INCREMENT`. We will similarly use a key *nextid* which is a simple integer, to keep track of snippets. We will use Redis's *atomic* operation `INCR` to get an id:

    INCR nextid
    Now you can use the new returned id, which will be unique

The snippet itself is stored as a JSON map. The inbuilt functions `JSON.stringify` and `JSON.parse` are used to convert to and fro.

    {
      'language' : '<language>',
      'snippet' : '<Actual data>',
    }

Redis allows values to be upto 1GB in size, so we don't have to worry about that.

## First code ##

First lets get nerve started so that we get something which works. nerve accepts a list of routes, based or regular expressions, and calls the associated function. For the first run lets just display the string 'Hello World'. Add the following to snip.js:

    nerve.create( [
      [ /.*/, function( req, res ) { res.respond( "Hello World" ); } ]
    ]).listen( 8000 );

`./run snip.js` and point your browser to http://localhost:8000. Its as simple as that. `/.*/` means match any URL and invoke this function. Each function is passed two argIts as simple as that. `/.*/` means match any URL and invoke this function. Each function is passed two arguments, `request` and `response`. `request` will have lots of information about the client request, like headers and form data which we are interested in. `response` is used to send content back to the client. `respond.respond(data)` sends all the data to the browser and closes the connection.

Node relies on asynchronous I/O and so we will often be dealing with streaming data. The lower level methods `respond.sendHeader()`, `respond.write()` and `response.close()` will allow us to apply streaming. This will be used when we Syntax-highlight code.

## Adding Snippets ##

Before we can do anything, we need some data, so let's create the form. Since it's pretty simple, we'll just put it as a string. Usually you would store all these *views* in files and stream them over the connection.

A particularly nasty part of our code is the list of languages, generated by [getLanguageList][], which I haven't included here, but is present in the code. Ideally you wouldn't have this *data* in your *code*.

So this is a part of `snip.js`

<node-redis-fun/snip.js#formHtml>
  
    var addSnippet = function() {}
    var showSnippet = function() {}
  
<node-redis-fun/snip.js#create>

### Handling post data ###

Each `nerve` handler function receives two arguments, the first is a [http.ServerRequest](http://nodejs.org/api.html#_http) object and the second is a [http.ServerResponse](http://nodejs.org/api.html#_http).

POST data is sent in the body of the Request. Since the data is streamed we have to add a listener function to collect all the data into a buffer. The Request will *emit* a `end` signal when all data has been received, so we know when to stop. Once we have all the data, we want to parse it and use it. To make this generic we pass `getPostParams` a [callback][] function, which it will call with the results of the query.

We can parse the form data using the querystring module, so that our function becomes:

<node-redis-fun/snip.js#getPostParams>

Now lets just get `addSnippet()` to echo the form data:

    var addSnippet = function( req, res ) {
      getPostParams(req, function( obj ) {
        res.respond( sys.inspect( obj ) );
      });
    }

Now if you try posting some code you should see the object literal being echoed back.

### Store the snippet ###
Instead of echoing back the POST data, lets now store it in Redis, thus finishing half the implementation of the pastebin. We have to:

1. Get a unique id for the URL
2. Store the data
3. When both succeed, display the URL to the user.

Again, fitting with node's asynchronous model, we will have to use a sequence of callbacks. Remember that each function introduces a scope with its own *this* reference, so make sure you save any this references in outer scopes as some other variable:

<node-redis-fun/snip.js#addSnippet>

The SET operation sets a key to the string value. We use JSON.stringify to get a nice string representation of the request object. Finally once the save is successful we notify the user. That's it, your snippet is saved and ready to show, which brings us to...

### Syntax highlighting ###

Since `pygmentize` is an external program we are going to spawn a child process and pass it various options. Pygmentize will wait on stdin and write out to stdout. So we are going to do something similar to pipes in shells.

    pygmentize [options] < redis data > browser

It would have been even cooler if redis-node-client supported streaming the data rather than buffering it, but you can't have everything... . Anyway this is how we call pygmentize:

    // for now just assume we magically
    // got the snippet JSON parsed into obj
  
    // get the language short code
    // not that languages is an array of
    // ["shortcode", "name"] elements and filter
    // returns a *list* so we need the 0th element.
    var shortcode = languages.filter( function(el) {
      return el[0] == obj.language;
    }) [0][0];
  

    var pyg = cp.spawn( "pygmentize",
                      [ "-l", shortcode,
                        "-f", "html",
                        "-O", "full,style=pastie",
                        "-P", "title=Snippet #" + id ] );
    pyg.stdout.on( "data", function( coloured ) {
      if( coloured )
        res.write( coloured );
    } );

    pyg.on( 'exit', function() {
      res.end();
    });

    pyg.stdin.write( obj.code );
    pyg.stdin.end();

The first half is pretty self explanatory. We add a
listener `data` to watch for data on the child's *stdout*. Then we send the plain code to pygmentize via its *stdin*. It is necessary to close the stream otherwise pygmentize will keep waiting for data and won't generate output. We incrementally write out data as it is received. `coloured` will be null when done.

To get the actual snippet to fetch, we are going to
get nerve to pass us the id. In routing

<node-redis-fun/snip.js#create>

The `([0-9]+)` _match group_ will be extracted by
nerve and passed to the handler as the third argument.
With that in place we are ready to show the output.

<node-redis-fun/snip.js#showSnippet>

The Redis related code is pretty similar to `addSnippet()`. In case the key doesn't exist, we will get a null. So we use `sendHeader()` to send a *404 Page Not Found*, and stop. Otherwise we send a healthy 200, tell the browser to expect HTML and then stream the data. Start the server, visit `/<id>` and get your freshly highlighted code!

## I want more ##

Extend the simple pastebin to allow expiry (HINT: The Redis EXPIRE command), allow people to edit the bin and keep a diff history or more. One big improvement would be to cache the pygmentize results as that could really slow down a popular site with a large number of requests per second.

[How To Node](http://howtonode.org) has more great articles about writing other web apps. Tinker around with writing JavaScript bindings for C/C++ libraries or go build  a Asynchronous, Distributed Googolplexbazillion search engine.

Full code for this article can be found at [Bitbucket](http://bitbucket.org/nikhilm/snip)

[getLanguageList]: http://gist.github.com/310877
[callback]: http://howtonode.org/control-flow
