Title: Asynchronous Control Flow with Promises
Author: Nathan Stott
Date: Tue Dec 20 2011 08:00:00 GMT-0700 (PDT)
Node: v0.6.5

# Introduction to Promises

A Promise is an object that encapsulates the state of an asynchronous operation. Promises are also
referred to as futures and deferreds in some communities.

## Goal of this Article

The goal of this article is to introduce CommonJS promises as they exist in Node.JS user-land.
With jQuery adopting a version of CommonJS promises for AJAX operations, promises will likely gain
a broader userbase in the browser and on the server.

## Brief History of Promises in Node

Promises based on EventEmitters were originally a part of Node.JS. They were removed because 
they were deemed unnecesarry for low-level infrastructure. Also, the promises in NodeJS core did
not satisfy the contract that many advocates for Promises wished they did. Therefore, Node.JS
core went with a callback model and Promises were left to user-land.

## Promise Terminology

* Resolve: A successful Promise is 'resolved' which invokes the success listeners that are waiting and remembers the value that was resolved for future success listeners that are attached. Resolution correlates to a returned value.
* Reject: When an error condition is encountered, a Promise is 'rejected' which invokes the error listeners that are waiting and remembers the value that was rejected for future error listeners that are attached. Rejection correlates to a thrown exception.
* Callback: A function executed upon successful resolution of a Promise.
* Errback: A function executed when a Promise is rejected
* Progressback: A function executed to provide intermediate results of a Promise.

## Promise Libraries

### Server Side

There are two primary implementations of CommonJS promises for NodeJS:

#### [Q library](https://github.com/kriskowal/q) by Kris Kowal. 

Install with NPM: `npm install q`

    var q = require('q');

#### [Promised-IO](https://github.com/kriszyp/promised-io) by Kris Zyp.

Install with NPM: `npm install promised-io`

    var q = require('promised-io/lib/promise'); // <=v2.3

    var q = require('promised-io/promise'); // >=v2.4

They are compatible with one anothers promises, so which you use is merely a matter of preference.
These libraries do contain different helper functions outside of the basic functions necesarry
to consume and create promises.

The rest of the server-side examples will assume that a `q` variable containing a promise module is in scope.

### Client Side

jQuery implemented Promises in version 1.5.

    $.when($.get(...)).then(function() { console.log('success!') }, function() { console.log('rejection'); });

## The Promise Contract

### There is ONE Resolution of Rejection

A promise is resolved or rejected one time. It will never be resolved if it has been rejected or rejected if it has been resolved.
A resolved promise will never be resolved again and a rejected promise will never be rejected again.

### Listeners are executed ONE time

An individual callback or errback will be executed once and only once. This follows from the first rule of the contract.

### Promises remember their staet

A promise that is resolved remembers its resolution value. If a callback is attached in the future to this promise, it will be
executed with the previously resolved value. The same is true of errbacks. If a promise is rejected and an errback is attached
after the rejection, it will be executed with the rejected value.

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

The `when` function is a helper to attach listeners to an object that you are not sure is a promise. This is useful because 
it is often helpful for methods to be able to return a promise or a direct value. If a direct value is returned, it will not
have a `then` method.

    when(maybePromise, function() {
      // callback, executed on successful promise resolution or if maybePromise is not a promise but a value
    }, function() {
      // errback, executed on rejection
    }, function() {
      // progressback, executed if the promise has progress to report
    });

## Bubbling

The value returned by a callback is bubbled up the chain of promises. The same is true of rejections.
This allows for rejections to be hanlded at a higher level than the function that called the promise-returning
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
has a `promise` property that is the promise that it is managing. It also has `resolve` and
`reject` methods that are responsible for resolving or rejecting the promise.

Resolve is a function that may be passed a value or a promise. It should not be called more
than one time and it is an error to do so. If it is passed a promise, it resolves its 
promise with the passed promise. If it is passed a value, it resolves its promise with
the passed value.

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

## Wrapping a function that takes a Node.JS-style callback

The majority of functions that take Node.JS-style callbacks are suitable for wrapping in a Promise.
Any Node.JS-style callback function that only calls its callback one time may be wrapped.

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

## Conclusions

Promises are a valualbe tool for managing asynchronous control flow. With jQuery adopting
Promises, more JavaScript programmers will see them as the preferred method of managing
asynchronous state. If you have any questions, please leave them in the comments section.