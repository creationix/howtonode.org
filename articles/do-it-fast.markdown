Title: "Do" it fast!
Author: Tim Caswell
Date: Mon Feb 22 2010 10:52:08 GMT-0600 (CST)

Now with the release of [Node v0.1.30][] there is even more need for a library like [Do][].  While working with the node community to decide on the best alternative to node promises, we decided that it's best left to library developers.  So as of this morning, node no longer ships with promises, but uses a simple callback interface for all async functions.

I took my async library that I've been developing throughout the Control Flow series and made it into a real library called [Do][].

## Node callback interface

All async functions in node now use a simple callback based interface:

    fs.readdir("/usr", function (err, files) {
      if (err) throw err;
      puts("/usr files: " + files);
    });

That is, after the arguments, there is a callback function expected.  This callback function will be given the error if there was one, and if not, the result after that.

Creating an async function that exports this interface is simple too [plain_callbacks.js][]:

    // Load 'fs', a built-in node library that has async functions
    var fs = require('fs');

    function safeRead(filename, callback) {
      fs.readFile(filename, function (err, data) {
        if (err) {
          if (error.errno === process.ENOENT) {
            // Ignore file not found errors and return an empty result
            callback(null, "");
          } else {
            // Pass other errors through as is
            callback(err);
          }
        } else {
          // Pass successes through as it too.
          callback(null, data);
        }
      })
    }

    safeRead(__filename, function (err, text) {
      if (err) {
        throw err;
      }
      puts(text);
    })

These callbacks are fast, simple, and to-the-point.  However, your code can get pretty hairy when you start expanding beyond these trivial examples.  These simple callback based functions can't be used with aggregate utilities, they can't be implicitly chained or grouped either.

## We can `Do` better.

`Do` is a library that adds higher level abstraction and continuables.  What I mean by a continuable is explained by the following:

### Continuables

    function divide(a, b) { return function (callback, errback) {
      // Use nextTick to prove that we're working asynchronously
      process.nextTick(function () {
        if (b === 0) {
          errback(new Error("Cannot divide by 0"));
        } else {
          callback(a / b);
        }
      });
    }}

`Do` expects async functions to not require the callback in the initial invocation, but instead return a continuable which can then be called with the `callback` and `errback`.  This is done by manually currying the function. The "continuable" is the function returned by the outer function.  The body of the function won't be executed until you finish the application by attaching a callback.

    divide(100, 10)(function (result) {
      puts("the result is " + result);
    }, function (error) {
      throw error;
    });

This style is extremely simple (doesn't require an external library like process.Promise to use), and is fairly powerful.

 - The initial function can have variable arguments.
 - The continuable itself is portable until it's invoked by attaching callbacks.

### Why is this better than plain-ol-callbacks?

Well, let's convert the `safeRead` example from above to continuables [continuable_based.js][]:

    var Do = require('do');
    // Convert `readFile` from fs to use continuable style.
    var fs = Do.convert(require('fs'), ['readFile']);

    function safeRead(filename) { return function (callback, errback) {
      fs.readFile(filename)(callback, function (error) {
        if (error.errno === process.ENOENT) {
          callback("");
        } else {
          errback(error);
        }
      })
    }}

    safeRead(__filename)(puts, errorHandler);

You'll notice that this is a lot shorter and you don't have to constantly check for the error argument or pad your success results with a `null` argument.  Also since we're passing through the success case as is, we can use the outer `callback` as the inner `callback`.  In most cases you won't do this for success, but you will for `errback`.

### What about the rest of `Do`?

The real power of `Do` and continuables comes when you're dealing with several async functions as once.  Let's take our example from the [third control flow article][] and convert it to use the new `Do` library:

    var Do = require('do');
    var fs = Do.convert(require('fs'), ['readdir', 'stat', 'readFile']);

    // Checks the `stat` of a file path and outputs the file contents if it's
    // a real file
    function loadFile(path, callback, errback) {
      fs.stat(path)(function (stat) {

        // Output undefined when the path isn't a regular file
        if (!stat.isFile()) {
          callback();
          return;
        }

        // Pass through the read to regular files as is.
        fs.readFile(path)(callback, errback)

      }, errback);
    }

    // Load an array of the contents of all files in a directory.
    function loaddir(path) { return function (callback, errback) {
      fs.readdir(path)(function (filenames) {
        Do.filterMap(filenames, loadFile)(callback, errback);
      }, errback);
    }}

    loaddir(__dirname)(p, errorHandler)

## How to `Do` (API)

The `Do` library makes doing higher-level abstractions easy.  All of these helpers are themselves continuables so you can attach callbacks by calling the returned, curried function.

### Do.parallel(actions) {...}

Takes an array of actions and runs them all in parallel. You can either pass in an array of actions, or several actions as function arguments.

 - If you pass in an array, then the output will be an array of all the results
 - If you pass in separate arguments, then the output will have several arguments.

**Example:**

    // Multiple arguments
    Do.parallel(
      Do.read("/etc/passwd"),
      Do.read(__filename)
    )(function (passwd, self) {
      // Do something
    }, errorHandler);

    // Single argument
    var actions = [
      Do.read("/etc/passwd"),
      Do.read("__filename")
    ];
    Do.parallel(actions)(function (results) {
      // Do something
    }, errorHandler);

### Do.chain(actions) {...}

Chains together several actions feeding the output of the first to the input of the second and the final output to the continuables callback.

**Example:**

    // Multiple arguments
    Do.chain(
      Do.read(__filename),
      function (text) {
        return Do.save("newfile", text);
      },
      function () {
        return Do.stat("newfile");
      }
    )(function (stat) {
      // Do something
    }, errorHandler);

    // Single argument
    var actions = [
      Do.read(__filename),
      function (text) {
        return Do.save("newfile", text);
      },
      function () {
        return Do.stat("newfile");
      }
    ];
    Do.chain(actions)(function (stat) {
      // Do something
    }, errorHandler);

### Do.map(array, fn) {...}

Takes an array and does an array map over it using the async callback `fn`. The signature of `fn` is `function fn(item, callback, errback)` or any regular continuable.

**Example:**

    // Direct callback filter
    var files = ['users.json', 'pages.json', 'products.json'];
    function loadFile(filename, callback, errback) {
      fs.read(filename)(function (data) {
        callback([filename, data]);
      }, errback);
    }
    Do.map(files, loadFile)(function (contents) {
      // Do something
    }, errorHandler);

    // continuable based filter
    var files = ['users.json', 'pages.json', 'products.json'];
    Do.map(files, fs.read)(function (contents) {
      // Do something
    }, errorHandler);

### Do.filter(array, fn) {...}

Takes an array and does an array filter over it using the async callback `fn`. The signature of `fn` is `function fn(item, callback, errback)` or any regular continuable.

**Example:**

    // Direct callback filter
    var files = ['users.json', 'pages.json', 'products.json'];
    function is_file(filename, callback, errback) {
      fs.stat(filename)(function (stat) {
        callback(stat.isFile());
      }, errback);
    }
    Do.filter(files, is_file)(function (filtered_files) {
      // Do something
    }, errorHandler);

    // Continuable based filter
    var files = ['users.json', 'pages.json', 'products.json'];
    function is_file(filename) { return function (callback, errback) {
      fs.stat(filename)(function (stat) {
        callback(stat.isFile());
      }, errback);
    }}
    Do.filter(files, is_file)(function (filtered_files) {
      // Do something
    }, errorHandler);

### Do.filterMap(array, fn) {...}

Takes an array and does a combined filter and map over it.  If the result
of an item is undefined, then it's filtered out, otherwise it's mapped in.
The signature of `fn` is `function fn(item, callback, errback)` or any regular continuable.

**Example:**

    // Direct callback filter
    var files = ['users.json', 'pages.json', 'products.json'];
    function check_and_load(filename, callback, errback) {
      fs.stat(filename)(function (stat) {
        if (stat.isFile()) {
          loadFile(filename, callback, errback);
        } else {
          callback();
        }
      }, errback);
    }
    Do.filterMap(files, check_and_load)(function (filtered_files_with_data) {
      // Do something
    }, errorHandler);

    // Continuable based filter
    var files = ['users.json', 'pages.json', 'products.json'];
    function check_and_load(filename) { return function (callback, errback) {
      fs.stat(filename)(function (stat) {
        if (stat.isFile()) {
          loadFile(filename, callback, errback);
        } else {
          callback();
        }
      }, errback);
    }}
    Do.filterMap(files, check_and_load)(function (filtered_files_with_data) {
      // Do something
    }, errorHandler);

## Using with node libraries

Do has a super nifty `Do.convert` function that takes a library and converts it to use Do style continuables.  For example, if you wanted to use `fs.readFile` and `fs.writeFile`, then you would do this:

    var fs = Do.convert(require('fs'), ['readFile', 'writeFile']);

Do will give you a copy of `fs` that has `readFile` and `writeFile` converted to Do style.  It's that easy!

## For library writers

All async functions in node follow a common interface:

    method(arg1, arg2, arg3, ..., callback)

Where `callback` is of the form:

    callback(err, result1, result2, ...)

This is done to keep node simple and to allow for interoperability between the various async abstractions like Do continuables and CommonJS promises.

If you're writing a library, make sure to export all your async functions following the node interface.  Then anyone using your library can know what format to expect.

[third control flow article]: http://howtonode.org/control-flow-part-iii
[plain_callbacks.js]: http://github.com/creationix/howtonode.org/blob/master/articles/do-it-fast/plain_callbacks.js
[continuable_based.js]: http://github.com/creationix/howtonode.org/blob/master/articles/do-it-fast/continuable_based.js
[Node v0.1.30]: http://groups.google.com/group/nodejs/browse_thread/thread/e6cc6f04cd0ddf14
[Do]: http://github.com/creationix/do