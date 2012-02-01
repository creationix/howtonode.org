Title: Asynchronous Control Flow with Promises
Author: Nathan Stott
Date: Tue Dec 20 2011 08:00:00 GMT-0700 (PDT)
Node: v0.6.5

A Promise is an object that represents the result of an asynchronous function call. Promises are also
called futures and deferreds in some communities.

## Goal of this Article

The goal of this article is to introduce CommonJS promises as they exist in NodeJS user-land.
With jQuery popularizing a variant of CommonJS promises for AJAX operations, promises will likely gain
a broader user-base in the browser and on the server.

## Brief History of Promises in Node

Promises based on EventEmitters were originally a part of Node.  They looked like this:

    var promise = fs.stat("foo");
    promise.addListener("success", function (value) {
        // ok
    })
    promise.addListener("error", function (error) {
        // error
    });

The style required more allocations than necessary.
There were also political issues because these "promises" did not fulfill all of
the contracts that advocates for promises insisted they must.  Between
aesthetics, politics, and reductionism, Ryan removed promises in the v0.2
era and settled on the present callback style, leaving promises as an
exercise for user-land.

    fs.stat("foo", function (error, value) {
        if (error) {
            // error
        } else {
            // ok
        }
    });

## Promise Terminology

* Fulfillment: When a successful promise is fulfilled, all of the pending callbacks are called with the value. If more callbacks are registered in the future, they will be called with the same value. Fulfilment is the asynchronous analog for returning a value.
* Rejection: When a promise cannot be fulfilled, a promise is 'rejected' which invokes the errbacks that are waiting and remembers the error that was rejected for future errbacks that are attached. Rejection is the asynchronous analog for throwing an exception.
* Resolution: A promise is resolved when it makes progress toward fulfillment or rejection.  A promise can only be resolved once, and it can be resolved with a promise instead of a fulfillment or rejection.
* Callback: A function executed if a a promise is fulfilled with a value.
* Errback: A function executed if a promise is rejected, with an exception.
* Progressback: A function executed to show that progress has been made toward resolution of a promise.

## Promise Libraries

### Server Side

There are two primary implementations of CommonJS promises for Node:

#### [Q library](https://github.com/kriskowal/q) by Kris Kowal. 

Install with NPM: `npm install q`

    var q = require('q');

#### [Promised-IO](https://github.com/kriszyp/promised-io) by Kris Zyp.

Install with NPM: `npm install promised-io`

    var q = require('promised-io/lib/promise'); // <=v2.3

    var q = require('promised-io/promise'); // >=v2.4

They are compatible and even capable of consuming each others promises, so which you use
is a matter of preference. These libraries do different helper functions outside 
of the basic functions necessary to consume and create promises.

The rest of the server-side examples will assume that a `q` variable referencing
a promise module is in scope.

### Client Side

jQuery implemented Promises in version 1.5.

    $.when($.get(...))
    .then(function(value) {
        console.log('success!')
    }, function(error) {
        console.log('rejection');
    });

## The Promise Contract

### There is *one* Resolution or Rejection

A promise is resolved one time. It will never be fulfilled if it has been rejected
or rejected if it has been fulfilled.

### Listeners are executed *one* time

An individual callback or errback will be executed once and only once. This follows
from the first rule of the contract.

### Promises remember their state

A promise that is resolved with a value remembers the fulfillment. If a
callback is attached in the future to this promise, it will be executed
with the previously resolved value. The same is true of errbacks. If a
promise is rejected and an errback is attached after the rejection, it will
be executed with the rejected value.  Promises behave the same way regardless
of whether they are already resolved or resolved in the future.

## Thenables

CommonJS promises are sometimes referred to as thenables. This term derives from the `then` method available on a promise.
The `then` method is the gateway to attaching callbacks, errbacks, and progressbacks.

    myPromise.then(function() {
      // callback, executed on successful promise resolution
    }, function() {
      // errback, executed on rejection
    }, function() {
      // progressback, executed if the promise has progress to report
    });

## When

The `when` function is a helper to attach listeners to an object that you are
not sure is a promise. This is useful because it is often helpful for methods
to be able to return a promise or a direct value. If a direct value is returned,it will not
have a `then` method.  Also, if the promise does not implement `then` properly,
the `when` function makes sure that it behaves properly by ensuring your callbacks
are called in separate events and never more than once.

    when(maybePromise, function() {
      // callback, executed on successful promise resolution or if maybePromise is not a promise but a value
    }, function() {
      // errback, executed on rejection
    }, function() {
      // progressback, executed if the promise has progress to report
    });

## Bubbling

The value returned by a callback is bubbled up the chain of promises. The same is true of rejections.
This allows for rejections to be handled at a higher level than the function that called the promise-returning
function that is rejected. This also allows promise-based APIs to compose responses for rejections and successes
by changing the value or error as it is bubbled.

    function doSomethingAsync() {
      return asyncHelper().then(function(val) {
        // do some extra processing on val
        return val; <-- becomes the resolution of the promise returned by doSomethingAsync
      });
    }

    doSomethingAsync().then(function(val) {
      console.log('resolved', val);
    }, function(err) {
      // Will receive rejections from doSomethingAsync or bubbled from asyncHelper
      console.log('error', err);
    });

## Creating Promises using the Deferred helper

A Deferred is an object that helps create and manipulate promises. A Deferred
has a `promise` property that references the promise that it manages. It also
has `resolve` and `reject` methods that are responsible for resolving / rejecting
the promise.

`resolve` is a function that may be passed a value or a promise.
If it is passed a value, the promise is fulfilled.
If it is passed a promise, that promise’s resolution will eventually
be forwarded to this one.

Both Kris Kowal's Q and Kris Zyp's Promised-IO libraries enforce the rule
that a promise can only be resolved once.  Kris Kowal’s Q library allows multiple
agents to “race” to be the first to resolve the promise. Kris Zyp’s Promised-IO
throws an exception if you attempt to resolve a promise a second time.

Reject is a function that accepts a reason for rejection. The rejection may be of any type but
is commonly a string. The Deferred rejects its promise with the rejection reason.

    function doSomethingAsync() {
      var deferred = q.defer();
      setTimeout(function() {
        deferred.resolve('hello world');
      }, 500);

      return deferred.promise;
    }

    doSomethingAsync().then(function(val) {
      console.log('Promise Resolved!', val);
    });

## Wrapping a function that takes a Node-style callback

The majority of functions that take Node-style callbacks are suitable for wrapping in a Promise.
Any Node-style callback function that only calls its callback one time may be wrapped.

The following function is taken from [Bogart](https://github.com/nrstott/bogart).

    function promisify(nodeAsyncFn, context) {
      return function() {
        var defer = q.defer()
          , args = Array.prototype.slice.call(arguments);

        args.push(function(err, val) {
          if (err !== null) {
            return defer.reject(err);
          }

          return defer.resolve(val);
        });

        nodeAsyncFn.apply(context || {}, args);

        return defer.promise;
      };
    };

This function can be used with node functions like `fs.readFile`.

    var readFile = promisify(fs.readFile);
    readFile('test.txt').then(function(data) {
      console.log(data);
    });

Both Q and PromisedIO provide utilities for wrapping or calling Node-style
functions.

With Kris Zyp’s PromisedIO:

    var readFile = q.convertNodeAsyncFunction(fs.readFile);
    readFile('test.txt')
    .then(function (data) { });

    // or

    q.execute(fs.readFile, 'test.txt')
    .then(function (data) { });

With Kris Kowal’s Q:

    var readFile = q.node(fs.readFile);
    readFile('test.txt')
    .then(function (data) { });

    // or

    q.ncall(fs.readFile, fs, 'test.txt')
    .then(function (data) { });

    // or

    var deferred = q.defer();
    fs.readFile('test.txt', deferred.node());
    return deferred.promise;
    
## Conclusions

Promises are a valuable tool for managing asynchronous control flow. With jQuery adopting
Promises, more JavaScript programmers will see them as the preferred method of managing
asynchronous state. If you have any questions, please leave them in the comments section.

