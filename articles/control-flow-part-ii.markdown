Title: Control Flow in Node Part II
Author: Tim Caswell
Date: Thu Feb 04 2010 02:24:35 GMT-0600 (CST)
Node: v0.1.102

I had so much fun writing the last article on control flow, that I decided to play around with the feedback I received.  One thing in particular I want to talk about is the good work [inimino][] is doing.

Node has two constructs that are used currently to handle async return values, namely callbacks and event emitters.  You can read all about those on the [nodejs.org][] website.  I’m going to talk about these and another way to manage asynchronous return values and streaming events.

**UPDATE** Promises were removed from node a while back, this article has been updated to show callbacks instead of promises.  For promises see [node-promise][].

## Why the distinction between Callback and EventEmitter? ##

In node there are two event handling techniques.  They are called callbacks, and EventEmitter.  Callbacks are for the async equivalent of a function.

<control-flow-part-ii/callback.js>

`fs.readFile()` takes a filename and "*returns*" the contents of the file.  It doesn’t actually return it, but passes it to the passed in callback function.

Sometimes you want to listen for events that can happen several times.  For example in a web server, when processing a web request, the `data` event is fired one or more times and then the `end` event gets fired:

<control-flow-part-ii/http-body.js>

The difference is that with a callback you’re either going to get an error or a result.  Never both, and never more than one event.  For cases where there are more than two events and/or they can be called multiple times, then you need the more powerful and flexible EventEmitters.

## The Node.js Callback style

Node originally had promises instead of callbacks.  Read the older versions of this article for more information.  After much debate, node decided to drop Promises for simple callbacks.

Any async function in node accepts a callback as it’s last parameter.  Most the functions in the `'fs'` module are like this.  Then that callback is going to get the error (if any) as the first parameter.

    // You call async functions like this.
    someAsyncFunction(param1, param2, callback);
    
    // And define your callback like this
    function callback(err, result) {...}

## There could be another way ##

Promises worked well, but after reading about continuables from [inimino][], I was inspired to try another way.

Remember our first example? Suppose that fs.readFile was used like this:

<control-flow-part-ii/continuable.js>

Instead of expecting a callback, it returns a function that’s expecting two callback methods:  One for success and one for error.  I call this the `Do` style, and you’ll soon see why.

## Making callback style actions ##

Often we will want to make custom functions that don’t return a value right away.  Using this new style, let’s make a `fileWrite` function that looks like this (assuming that the fs functions were converted to this style too):

<control-flow-part-ii/file-write.js>

Notice how easy it is to chain the error messages back up to our caller.  Also this code is much shorter, and easier to read. (Than the original promise version, not the callback version)

The key to making these actions is to, instead of creating a promise and returning, return a function that takes two callbacks and then call them directly when needed.

## The Do library ##

I came up with a small library called `Do` earlier today.  Actually it’s not much, just a single function that does parallel actions much like the Combo Library from the last article.

### Implementation ###

Here is the entire library:

<control-flow-part-ii/do.js>

But combined with the callback style actions, this can lead to some very powerful and concise code.

### Single Action ###

Let’s assume that we have a function `readFile` that uses this new technique.  Here is how it’s used:

    // A single async action with error handling
    readFile('secretplans.txt')(function (secrets) {
      // Do something
    }, function (error) {
      // Handle Error
    });

### Parallel actions ###

Now let’s combine that with the Do library:

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

This will read the file 'names.txt'.  When that’s done it will call `upcase_slowly`. When that’s done it will pass the new string to `save_data`, which wraps `writeFile`.  When `writeFile` is done our final callback will be invoked.

Just for fun, here is the same example translated to the [Jack][] language (still in development).

    readFile names.txt
    | fun string -> next ->
      timeout 100, fun ->
        next string.toUpperCase()
    | fun string -> next ->
      writeFile 'names_up.txt', string | next
    | fun ->
      # File was saved

**UPDATE** I have since made a more powerful library that embraces node’s native callback style called Step.  Read more on it’s article [step-of-conductor][].

[Jack]: http://github.com/creationix/jack
[inimino]: http://inimino.org/~inimino/blog/fileio_first_release
[node-promise]: http://github.com/kriszyp/node-promise
[nodejs.org]: http://nodejs.org/
[step-of-conductor]: /step-of-conductor