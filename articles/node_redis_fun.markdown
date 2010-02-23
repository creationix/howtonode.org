Title: Node + Redis = Fun
Author: Nikhil Marathe
Date: Sat Feb 20 2010 23:26:00 GMT+530 (IST)

node brings asynchronous, evented I/O to the server. Redis gives you a blazing fast database with support for strings, lists and sets. Both Redis and Node.js follow certain patterns, Redis for data-storage, and node for event based programming. I hope to give an introduction to both in this article. By the time we are done, we will have built a [Pastebin][] service.

[Pastebin]: http://en.wikipedia.org/wiki/Pastebin

## Getting Started ##

I will assume that the reader is comfortable with Javascript, including using events and passing around functions.

Before we get down to the code, here is the software you will need:

* [node][] ( we will use [v0.1.30](http://github.com/ry/node/downloads) )
* [Redis][]
* [redis-node-client][] - to connect to Redis from node. Use the [bundled version](http://bitbucket.org/nikhilm/snip) as the original hasn't been updated for v0.1.30.**
* [nerve][] - A micro-framework to handle routing. Again use the bundled version.
* [underscore.js][] - A collection of useful javascript functions, we will use only one.
* [Pygments][] - Python program to syntax highlight code.

\*\*node v0.1.30 dropped the Promise based async method. Rather now all asynchronous code takes a handler function as the last argument. The function should have a prototype `function( err, arg1, arg2, ... )`, ie. an error code followed by its normal arguments. For a full discussion see the [relevant][] [discussions][].

[relevant]: http://groups.google.com/group/nodejs/msg/426f3071f3eec16b
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
    export SNIP_PATH=$(dirname `readlink -f 0`)
    
    export NODE_PATH=\
    $NODE_PATH\
    :$SNIP_PATH\
    :$SNIP_PATH/deps/redis-node-client\
    :$SNIP_PATH/deps/nerve/lib\
    :$SNIP_PATH/deps/ # underscore.js
    
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

Lets begin with a simpler way to connect to Redis.

    var redis = require('redisclient')
      , nerve = require('nerve')
    
    /* Passes cb to a new instance redis.Client.connect
     * but handles error in connecting
     * accepts optional errback as second argument
     * the callback gets a this.redis representing the redis object
     *
     * Returns nothing
     */
    withRedis = function( cb ) {
      var errback = arguments[1];
    
      var r = new redis.Client();
    
      r.connect( _.bind( cb, { redis : r } ) );
    
      r.addListener( "close", function(error) {
        if( error ) {
          process.stdio.writeError( "Error connecting to Redis database\n" );
          if( typeof(errback) === "function" )
            errback();
        }
      });
    }

The `withRedis` function wraps redis-node-client so that the function can use `this.redis` as a link rather than keeping around the connection object as a global. In addition it gives a warning in case it can't make a connection.

Next lets get nerve started so that we get something which works. nerve accepts a list of routes, based or regular expressions, and calls the associated function. For the first run lets just display the string 'Hello World'. Add the following to snip.js:

    nerve.create( [
      [ /.*/, function( req, res ) { res.respond( "Hello World" ); } ]
    ]).listen( 8000 );

`./run snip.js` and point your browser to http://localhost:8000. Its as simple as that. `/.*/` means match any URL and invoke this function. Each function is passed two argIts as simple as that. `/.*/` means match any URL and invoke this function. Each function is passed two arguments, `request` and `response`. `request` will have lots of information about the client request, like headers and form data which we are interested in. `response` is used to send content back to the client. `respond.respond(data)` sends all the data to the browser and closes the connection.

Node relies on asynchronous I/O and so we will often be dealing with streaming data. The lower level methods `respond.sendHeader()`, `respond.write()` and `response.close()` will allow us to apply streaming. This will be used when we Syntax-highlight code.

## Adding Snippets ##

Before we can do anything, we need some data, so let's create the form. Since it's pretty simple, we'll just put it as a string. Usually you would store all these *views* in files and stream them over the connection.

A particularly nasty part of our code is the list of languages, generated by [getLanguageList][], which I haven't included here, but is present in the code. Ideally you wouldn't have this *data* in your *code*.

So this is a part of `snip.js`

    var formHtml = '<form action="/add" method="post">'
          +  '<label for="code">Paste code</label><br>'
          +  '<textarea name="code" rows="25" cols="80"></textarea><br>'
          +  '<label for="language">Language</label>'
          +  '<select name="language">'
          +  genLanguageList()
          +  '</select>'
          +  '<input type="submit" value="Paste!" /></form>';
  
    var addSnippet = function() {}
    var showSnippet = function() {}
  
    nerve.create( [
      [ /^\/[0-9]+/, showSnippet ],
      [ nerve.post(/^\/add/), addSnippet ], // post(...) means handle only POST requests
      [ "/", function( req, res ) { res.respond( formHtml ); } ]
    ]).listen( 8000 );

### Handling post data ###

Each `nerve` handler function receives two arguments, the first is a [http.ServerRequest](http://nodejs.org/api.html#_http) object and the second is a [http.ServerResponse](http://nodejs.org/api.html#_http).

POST data is sent in the body of the Request. Since the data is streamed we have to add a listener function to collect all the data into a buffer. The Request will *emit* a `end` signal when all data has been received, so we know when to stop. Once we have all the data, we want to parse it and use it. To make this generic we pass `getPostParams` a [callback][] function, which it will call with the results of the query.

We can parse the form data using the querystring module, so that our function becomes:

    function getPostParams(req, callback){ 
      var body = ''; 
      req.addListener('data', function(chunk){
         body += chunk;
       }) 
       .addListener('end', function() { 
         var obj = qs.parse( body.replace( /\+/g, ' ' ) );
         callback( obj );
       });
    } 

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

    var addSnippet = function( req, res ) {
      getPostParams( req, function( obj ) {
        withRedis( function() {
          var redis = this.redis; // required in inner callback
    
          this.redis.incr( 'nextid' , function( err, id ) {
            redis.set( 'snippet:'+id, JSON.stringify( obj ), function() {
              var msg = 'The snippet has been saved at <a href="/'+id+'">'+req.headers.host+'/'+id+'</a>';
              res.respond( msg );
            } );
          } );
        }, function() {
          res.respond( "Error saving data. Please try again later" );
        });
      });
    };

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
  
    var pyg = process.
          createChildProcess( "pygmentize", // executable
                  [ "-l", shortcode, // -l specifies language
                    "-f", "html", // output format
                    "-O", "full,style=pastie", // get full html, color style
                    "-P", "title=Snippet #" + id] ); // more info
  
    pyg.addListener( "output", function( coloured ) {
      if( coloured )
        res.write( coloured );
      else
        res.close();
    });
  
    pyg.write( obj.code );
    pyg.close(); // VERY IMPORTANT

The first half is pretty self explanatory. We add a listener `output` to watch for data on the child's *stdout*. Then we send the plain code to pygmentize via its *stdin*. It is necessary to close the stream otherwise pygmentize will keep waiting for data and won't generate output. We incrementally write out data as it is received. `coloured` will be null when done.

To get the actual snippet to fetch, we are going to get nerve to pass us the id. Change the routing to

    nerve.create( [
      [ /^\/([0-9]+)/, showSnippet ],
      [ nerve.post("/add"), addSnippet ],
      [ "/", function( req, res ) { res.respond( formHtml ); } ]
    ]).listen( 8000 );

The `([0-9]+)` _match group_ will be extracted by nerve and passed to the handler as the third argument. 

    var showSnippet = function( req, res, id ) {
      withRedis( function() {
        this.redis.get( 'snippet:'+id, function( err, data ) {
          if( !data ) {
            res.sendHeader( 404 );
            res.write( "No such snippet" );
            res.close();
            return;
          }
    
          res.sendHeader( 200, { "Content-Type" : "text/html" } );
    
          var obj = JSON.parse( data );
          var shortcode = languages.filter( function(el) { 
            return el[0] == obj.language;
          } ) [0][0];
    
          var pyg = process.createChildProcess( "pygmentize",
                            [ "-l", shortcode,
                              "-f", "html",
                              "-O", "full,style=pastie",
                              "-P", "title=Snippet #" + id ] );
          pyg.addListener( "output", function( coloured ) {
            if( coloured )
              res.write( coloured );
            else
              res.close();
          } );
    
          pyg.write( obj.code );
          pyg.close();
        });
      });
    }
    

The Redis related code is pretty similar to `addSnippet()`. In case the key doesn't exist, we will get a null. So we use `sendHeader()` to send a *404 Page Not Found*, and stop. Otherwise we send a healthy 200, tell the browser to expect HTML and then stream the data. Start the server, visit `/<id>` and get your freshly highlighted code!

## I want more ##

Extend the simple pastebin to allow expiry (HINT: The Redis EXPIRE command), allow people to edit the bin and keep a diff history or more. One big improvement would be to cache the pygmentize results as that could really slow down a popular site with a large number of requests per second.

[How To Node](http://howtonode.org) has more great articles about writing other web apps. Tinker around with writing JavaScript bindings for C/C++ libraries or go build  a Asynchronous, Distributed Googolplexbazillion search engine.

Full code for this article can be found at [Bitbucket](http://bitbucket.org/nikhilm/snip)

[getLanguageList]: http://gist.github.com/310877
[callback]: http://howtonode.org/control-flow
