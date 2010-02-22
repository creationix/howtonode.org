Title: Control Flow in Node Part II
Author: Tim Caswell
Date: Thu Feb 04 2010 02:24:35 GMT-0600 (CST)

I had so much fun writing the last article on control flow, that I decided to play around with the feedback I received.  One thing in particular I want to talk about is the good work [inimino][] is doing.

Node has two constructs that are used currently to handle async return values, namely [promises and event emitters][].  You can read all about those on the [nodejs.org][] website.  I'm going to talk about these and another way to manage asynchronous return values and streaming events.

## Why the distinction between Promise and EventEmitter? ##

In node there are two event handling classes.  They are called Promise, and EventEmitter.  Promises are for the async equivalent of a function.

    var File = require('file');
    var promise = File.read('mydata.txt');
    promise.addCallback(function (text) {
      // Do something
    });
    promise.addErrback(function (err) {
      // Handle error
    })

File.read takes a filename and *returns* the contents of the file.

Sometimes you want to listen for events that can happen several times.  For example in a web server, when processing a web request, the `body` event is fired 1 or more times and then the `complete` event gets fired:

    Http.createServer(function (req, res) {
      var body = "";
      req.addListener('body', function (chunk) {
        body += chunk;
      });
      req.addListener('complete', function () {
        // Do something with body text
      });
    }).listen(8080);

The difference is that with a promise you're either going to get a success event or an error event.  Never both, and never more than one event.  For cases where there are more than two events and/or they can be called multiple times, then you need the more powerful EventEmitters.

## Creating a custom promise ##

Suppose I want to write a wrapper around `posix.open`, `posix.write`, and `posix.close`. Let's call it `fileWrite`. (This is extracted from the actual implementation of `File.write` in the "file" library.)

    function fileWrite (filename, data) {
      var promise = new events.Promise();
      posix.open(filename, "w", 0666)
        .addCallback(function (fd) {
          function doWrite (_data) {
            posix.write(fd, _data, 0, encoding)
              .addCallback(function (written) {
                if (written === _data.length) {
                  posix.close(fd);
                  promise.emitSuccess();
                } else {
                  doWrite(_data.slice(written));
                }
              }).addErrback(function () {
                promise.emitError();
              });
          }
          doWrite(data);
        })
        .addErrback(function () {
          promise.emitError();
        });
      return promise;
    };

And now this can be used as:

    fileWrite("MyBlog.txt", "Hello World").addCallback(function () {
      // It's done
    });

You'll note that we have to create a promise object, do our logic, and forward on the interesting results to the promise object.

## There could be another way ##

Promises work well, but after reading about continuables from [inimino][], I was inspired to try another way.

Remember our first example? Suppose that File.read was used like this:

    var File = require('file');
    File.read('mydata.txt')(function (text) {
      // Do something
    }, function (error) {
      // Handle error
    });

Instead of returning a promise object, it returns a function that's expecting two callback methods:  One for success and one for error.  I call this the `Do` style, and you'll soon see why.

## Making callback style actions ##

Often we will want to make custom functions that don't return a value right away.  Using this new style, our `fileWrite` from above would look like this (assuming that the posix functions were converted to this style too):

    function fileWrite (filename, data) { return function (callback, errback) {
      posix.open(filename, "w", 0666)(function (fd) {
        function doWrite (_data) {
          posix.write(fd, _data, 0, encoding)(
            function (written) {
              if (written === _data.length) {
                posix.close(fd);
                callback();
              } else {
                doWrite(_data.slice(written));
              }
            }, errback);
        }
        doWrite(data);
      }, errback);
    }};

Notice how easy it is to chain the error messages back up to our caller.  Also this code is much shorter, and easier to read.

The key to making these actions is to, instead of creating a promise and returning, return a function that takes two callbacks and then call them directly when needed.

## The Do library ##

I came up with a small library called `Do` earlier today.  Actually it's not much, just a single function that does parallel actions much like the Combo Library from the last article.

### Implementation ###

Here is the entire library:

    Do = {
      parallel: function (fns) {
        var results = [],
            counter = fns.length;
        return function(callback, errback) {
          fns.forEach(function (fn, i) {
            fn(function (result) {
              results[i] = result;
              counter--;
              if (counter <= 0) {
                callback.apply(null, results);
              }
            }, errback);
          });
        }
      }
    };

But combined with the callback style actions, this can lead to some very powerful and concise code.

### Single Action ###

Lets assume that we have a function `readFile` that uses this new technique.  Here is how it's used:

    // A single async action with error handling
    readFile('secretplans.txt')(function (secrets) {
      // Do something
    }, function (error) {
      // Handle Error
    });

### Parallel actions ###

Now let's combine that with the Do library:

    Do.parallel([
    	readFile('mylib.js'),
    	readFile('secretplans.txt'),
    ])(function (source, secrets) {
      // Do something
    }, function (error) {
      // Handle Error
    });

This does two async actions in parallel and reports when both are done. Note that it only fires success if there are no errors.  If there is an error, then it passes it to the common error handler.

You can also pass in an array of pre-made actions.

    var files = ["one.txt", "two.txt", "three.txt"];
    var actions = files.map(function (filename) {
      return readFile(filename);
    });

    Do.parallel(actions)(function () {
      var contents = {},
          args = arguments;
      files.forEach(function (filename, index) {
        contents[filename] = args[index];
      });
      // Do something
    });
    // Let error thow exception.

### Sequential Actions ###

For serial actions, simply chain the action functions.

    readFile('names.txt')(
      function upcase_slowly(string) { return function (next) {
        setTimeout(function () {
          next(string.toUpperCase());
        }, 100);
      }}
    )(
      function save_data(string) { return function (next) {
        writeFile('names_up.txt', string)(next);
      }}
    )(function () {
      // File was saved
    });

This will read the file 'names.txt'.  When that's done it will call `upcase_slowly`. When that's done it will pass the new string to `save_data`, which wraps `writeFile`.  When `writeFile` is done our final callback will be invoked.

Just for fun, here is the same example translated to the [Jack][] language (still in development).

    readFile names.txt
    | fun string -> next ->
      timeout 100, fun ->
        next string.toUpperCase()
    | fun string -> next ->
      writeFile 'names_up.txt', string | next
    | fun ->
      # File was saved

[Jack]: http://github.com/creationix/jack
[inimino]: http://inimino.org/~inimino/blog/fileio_first_release
[promises and event emitters]: http://nodejs.org/api.html#_events
[nodejs.org]: http://nodejs.org/
