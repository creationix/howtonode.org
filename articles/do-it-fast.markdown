Title: "Do" it fast!
Author: Tim Caswell
Date: Mon Feb 22 2010 10:52:08 GMT-0600 (CST)
Node: v0.1.102

Now with the release of [Node v0.1.30][] there is even more need for a library like [Do][].  While working with the node community to decide on the best alternative to node promises, we decided that it’s best left to library developers.  So as of this morning, node no longer ships with promises, but uses a simple callback interface for all async functions.

I took my async library that I’ve been developing throughout the Control Flow series and made it into a real library called [Do][].

## Node callback interface

All async functions in node now use a simple callback based interface:

<do-it-fast/async.js>

That is, after the arguments, there is a callback function expected.  This callback function will be given the error if there was one, and if not, the result after that.

Creating an async function that exports this interface is simple too:

<do-it-fast/plain_callbacks.js>

These callbacks are fast, simple, and to-the-point.  However, your code can get pretty hairy when you start expanding beyond these trivial examples.  These simple callback based functions can’t be used with aggregate utilities, they can’t be implicitly chained or grouped either.

## We can `Do` better.

`Do` is a library that adds higher level abstraction and continuables.  What I mean by a continuable is explained by the following:

### Continuables

<do-it-fast/divide.js#define>

`Do` expects async functions to not require the callback in the initial invocation, but instead return a continuable which can then be called with the `callback` and `errback`.  This is done by manually currying the function. The “continuable” is the function returned by the outer function.  The body of the function won’t be executed until you finish the application by attaching a callback.

<do-it-fast/divide.js#use>

This style is extremely simple, and is fairly powerful.

 - The initial function can have variable arguments.
 - The continuable itself is portable until it’s invoked by attaching callbacks.

### Why is this better than plain-ol-callbacks?

Well, let’s convert the `safeRead` example from above to continuables:

<do-it-fast/continuable_based.js>

You’ll notice that this is a lot shorter and you don’t have to constantly check for the error argument or pad your success results with a `null` argument.  Also since we’re passing through the success case as is, we can use the outer `callback` as the inner `callback`.  In most cases you won’t do this for success, but you will for `errback`.

### What about the rest of `Do`?

The real power of `Do` and continuables comes when you’re dealing with several async functions as once.  Let’s take our example from the [third control flow article][] and convert it to use the new `Do` library:


## How to `Do` (API)

The `Do` library makes doing higher-level abstractions easy.  All of these helpers are themselves continuables so you can attach callbacks by calling the returned, curried function.

### Do.parallel(actions) {...}

Takes an array of actions and runs them all in parallel. You can either pass in an array of actions, or several actions as function arguments.

 - If you pass in an array, then the output will be an array of all the results
 - If you pass in separate arguments, then the output will have several arguments.

**Example:**

<do-it-fast/parallel-example.js>

### Do.chain(actions) {...}

Chains together several actions feeding the output of the first to the input of the second and the final output to the continuables callback.

**Example:**

<do-it-fast/chain-example.js>

### Do.map(array, fn) {...}

Takes an array and does an array map over it using the async callback `fn`. The signature of `fn` is `function fn(item, callback, errback)` or any regular continuable.

**Example:**

<do-it-fast/map-example.js>

### Do.filter(array, fn) {...}

Takes an array and does an array filter over it using the async callback `fn`. The signature of `fn` is `function fn(item, callback, errback)` or any regular continuable.

**Example:**

<do-it-fast/filter-example.js>

### Do.filterMap(array, fn) {...}

Takes an array and does a combined filter and map over it.  If the result
of an item is undefined, then it’s filtered out, otherwise it’s mapped in.
The signature of `fn` is `function fn(item, callback, errback)` or any regular continuable.

**Example:**

<do-it-fast/filtermap-example.js>

## Using with node libraries

Do has a super nifty `Do.convert` function that takes a library and converts it to use Do style continuables.  For example, if you wanted to use `fs.readFile` and `fs.writeFile`, then you would do this:

    var fs = Do.convert(require('fs'), ['readFile', 'writeFile']);

Do will give you a copy of `fs` that has `readFile` and `writeFile` converted to Do style.  It’s that easy!

## For library writers

All async functions in node follow a common interface:

    method(arg1, arg2, arg3, ..., callback)

Where `callback` is of the form:

    callback(err, result1, result2, ...)

This is done to keep node simple and to allow for interoperability between the various async abstractions like Do continuables and CommonJS promises.

If you’re writing a library, make sure to export all your async functions following the node interface.  Then anyone using your library can know what format to expect.

[third control flow article]: http://howtonode.org/control-flow-part-iii
[plain_callbacks.js]: http://github.com/creationix/howtonode.org/blob/master/articles/do-it-fast/plain_callbacks.js
[continuable_based.js]: http://github.com/creationix/howtonode.org/blob/master/articles/do-it-fast/continuable_based.js
[Node v0.1.30]: http://groups.google.com/group/nodejs/browse_thread/thread/e6cc6f04cd0ddf14
[Do]: http://github.com/creationix/do