Title: Control Flow in Node Part III
Author: Tim Caswell
Date: Mon Feb 15 2010 09:21:11 GMT-0600 (CST)

While working on my quest to make async programming easier, or at least bearable, I discovered that often in programming you work with a set of data and want to do things on that set at once.

This article will explain a way to do async `filter` and `map` functions where the callback to `map` or `filter` is an async operation itself.  I will compare the simple task of reading all the files in a directory to memory.

## The Sync way

In a synchronous programming language this is very straightforward.  It can be done in node as well as long as you understand the consequences.  Currently about the only way to program synchronously in node is to use the `wait()` method of [promises][].  It's not a real sync command, but kinda emulates co-routines/fibers.  `wait` may or may not be deprecated in the near future.

For this example We'll need three methods from the `posix` (recently renamed to `fs`) package.  We need `readdir` to get a listing of files in a directory, `stat` to test the results (we only want files, not directories), and `cat` to read the contents to memory.

First we'll make a little module that wraps around these three commands and exposes a sync api:

    // Sync api wrapper around some Posix commands
    // Sells it soul to `wait`.
    var posix_sync = {
      readdir: function (path) {
        return Posix.readdir(path).wait();
      },
      stat: function (filename) {
        return Posix.stat(filename).wait();
      },
      cat: function (filename) {
        return Posix.cat(filename).wait();
      }
    }

Then solving the problem is very straightforward using sync style coding:

    // Here is the sync version:
    function scandir_sync(path) {
     return posix_sync.readdir(path).filter(function (filename) {
       return posix_sync.stat(filename).isFile();
     }).map(function (filename) {
       return [filename, posix_sync.cat(filename)];
     });
    }

Since the commands are sync we are able to use the built in `filter` and `map` from `Array.prototype` on the array returned by `posix_sync.readdir`.

This is extremely easy to code, but has dangerous side effects.  If these commands were truly sync then the program would be stopped blocking after every call waiting for some external IO to finish.  In comparison, CPU's are generally much faster than Hard Drives.

As a disclaimer, `wait()` in node isn't really synchronous, but it has other deep nasty implications because of the way it works.  [Search the mailing list][] for a history of people who had problems with `wait`.

Either way, you can't stat one file until the stat for the previous has returned, and you can't read any of the files until all the stats have finished.  Obviously this isn't optimal.

## The async way

They say that in computer science there is always a give and take when comparing different algorithms.  The pro to synchronous coding style is that it's very easy to read and write.  The con is that it's very inefficient.  That's why most programming languages need threads to achieve any level of concurrency, but node is able to do quite a bit on a single threaded platform.

To make the comparison simple, I'll wrap the `posix` library again, but this time in the continuable style.  The same could be done with regular promises, but the code would be more complicated.

    // Async api wrapper around some Posix commands
    // Uses continuable style for cleaner syntax
    var posix = {
      readdir: function (path) { return function (next) {
        Posix.readdir(path).addCallback(next);
      }},
      stat: function (filename) { return function (next) {
        Posix.stat(filename).addCallback(next);
      }},
      cat: function (filename) { return function (next) {
        Posix.cat(filename).addCallback(next);
      }}
    }

And an initial implementation of our `scandir` function would be this:

    // Here is the async version without helpers
    function scandir1(path) { return function (next) {
      posix.readdir(path)(function (filenames) {
        var realfiles = [];
        var count = filenames.length;
        filenames.forEach(function (filename) {
          posix.stat(filename)(function (stat) {
            if (stat.isFile()) {
              realfiles.push(filename);
            }
            count--;
            if (count <=0) {
              var results = [];
              realfiles.forEach(function (filename) {
                posix.cat(filename)(function (data) {
                  results.push([filename, data]);
                  if (results.length === realfiles.length) {
                    next(results);
                  }
                });
              });
            }
          });
        });
      });
    }}

Yikes! That is almost four times as long and indented several times deeper.  I know it's a trade-off, but at this point I'm thinking I'll return to Ruby with clusters of servers on the backend to handle concurrency.

### Map and Filter helpers for async code

Since map and filter are common tasks in programming and that's what we really want here, let's write some helpers to make this beast of code a little smaller:

    // Both of these take an array and an async callback.  When all callbacks
    // have returned, it sends the output to `next`

    function map(array, callback) { return function (next) {
      var counter = array.length;
      var new_array = [];
      array.forEach(function (item, index) {
        callback(item, function (result) {
          new_array[index] = result;
          counter--;
          if (counter <= 0) {
            new_array.length = array.length
            next(new_array);
          }
        });
      });
    }}

    function filter(array, callback) { return function (next) {
      var counter = array.length;
      var valid = {};
      array.forEach(function (item, index) {
        callback(item, function (result) {
          valid[index] = result;
          counter--;
          if (counter <= 0) {
            var result = [];
            array.forEach(function (item, index) {
              if (valid[index]) {
                result.push(item);
              }
            });
            next(result);
          }
        });
      });
    }}

Now with our helpers, let's try the async version again to see how much shorter we can make it:

    // Here is the async version with filter and map helpers:
    function scandir2(path) { return function (next) {
      posix.readdir(path)(function (filenames) {
        filter(filenames, function (filename, callback) {
          posix.stat(filename)(function (stat) {
            callback(stat.isFile());
          });
        })(function (filenames) {
          map(filenames, function (filename, callback) {
            posix.cat(filename)(function (data) {
              callback([filename, data]);
            });
          })(next);
        });
      });
    }}

That code is much shorter and easier to read.  Also now that code is executing in parallel, we can issue a stat call for all the files in a directory at once and then collect the results as they come in.  But with this version not a single `cat` can execute until all the `stat` calls finish.  In an ideal world the program would start reading the file as soon as it knows it's a file and not a directory.

### Combined filter and map helper

Often, and this is an example of this, you will want to filter and then map on the same data set.  Let's make a combined `filter_map` helper and see how it helps:

    function filter_map(array, callback) { return function (next) {
      var counter = array.length;
      var new_array = [];
      array.forEach(function (item, index) {
        callback(item, function (result) {
          new_array[index] = result;
          counter--;
          if (counter <= 0) {
            new_array.length = array.length;
            next(new_array.filter(function (item) {
              return typeof item !== 'undefined';
            }));
          }
        });
      });
    }}

I found it neat that this combined helper is about as small as the smaller of the two separate helpers.  That's very cool.

Now with this combined helper, let's write a truly parallel `scandir` function.

    // Here is the async version with a combined filter and map helper:
    function scandir3(path) { return function (next) {
      posix.readdir(path)(function (filenames) {
        filter_map(filenames, function (filename, callback) {
          posix.stat(filename)(function (stat) {
            if (stat.isFile()) {
              posix.cat(filename)(function (data) {
                callback([filename, data]);
              });
            } else {
              callback();
            }
          });
        })(next);
      });
    }}

Here we will issue all the `stat` commands at once, and as they come back, check to see if it's a file and if so, then fire off the `cat` command right away.  If not we'll output the result of `undefined` signifying to `filter_map` that we're not interested in that entry.  When the `cat` command comes back we'll send the file contents to the helper.  When all the items have either sent `undefined` or some text, then the helper knows it's done and gives us the result.

## Conclusion and Source Code

While it is a tradeoff in code complexity vs performance, with a little thinking and some good libraries, we can make async programming manageable enough to be understandable while taking full advantage of the parallel nature of non-blocking IO in node.

Full runnable source code can be found on [github][].  These examples were executed on node version `v0.1.28-68-gdc01587`.

[github]: http://github.com/creationix/howtonode.org/tree/master/articles/control-flow-part-iii/
[promises]: http://nodejs.org/api.html#_tt_events_promise_tt
[Search the mailing list]: http://groups.google.com/group/nodejs/search?group=nodejs&q=wait