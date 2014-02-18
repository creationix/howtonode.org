Title: Generators vs Fibers
Author: Tim Caswell
Date: Mon Sep 02 2013 17:08:56 GMT-0500 (CDT)
Node: v0.11.6

Both ES6 generators and [node-fibers][] can be used to block a coroutine while waiting on some I/O without blocking the entire process.

This means that you can wait for an I/O result within your code but still have the performance benefits of the single-threaded,  non-blocking I/O model you all know and love.

Both can do this for arbitrarily deep call stacks. The main difference between the capabilities of the two is how explicit the syntax is.  It's the classic battle between wanting to be safe while wanting to be flexible.

--------------------

## Generators - Safe, but Annoyingly Explicit

In code that uses generators there is a technique whereby a library will yield continuables or promises and the generator runner will pass in the callback, suspend the generator body, and resume when the callback gets called.

I will use my library, [gen-run][], in these examples because it's very simple and is the one I know best.  There are many others I link to in the gen-run [credits][].

### The Server

We'll start out by writing a simple HTTP server that uses generators to power the request handling logic.  It could look something like this.

<generators-vs-fibers/generator-server.js#server>

### The Handler

Initially when we write our programs, we often use canned data or otherwise have less I/O to perform to accomplish the given task.  In this example, we're using a simple module that returns the result directly.

<generators-vs-fibers/query.js>

Now our main app logic can be written.  Remember that the server expects us to be in a generator so let's write the logic as a generator.

We want each result to be tagged with the request count as it came into the server.  A simple shared variable that gets incremented at the beginning of each request should do the trick.

<generators-vs-fibers/generator-server.js#handler>

You can call this with as many concurrent requests as you want.  Each will have the correct `requestCount` because of run-to-finish semantics of JavaScript.  Even inside the bodies of generators, arbitrary function calls can't suspend your code.

### Modified Handler

Now suppose that down the line, our query function needed to actually do things and perform some I/O.

First we'll change the `query` function to return a continuable and/or accept a callback.  This is a common pattern for many node libraries that need to perform I/O.

<generators-vs-fibers/continuable-query.js>

We thought ahead and put the body of our handler in a generator to ease the transition, but that function call needs to change.  The query function now returns a continuable or expects a callback last.  Our handler function can now look like this.

<generators-vs-fibers/generator-server.js#continuable-handler>

Now we have that big bright `yield` keyword in there.  We can see plainly that our `requestCount` variable is in danger of a race condition.  What happens if a second request comes in while we're still waiting on the query from the first request?  They will clobber each other and both requests will be marked as #3, that's what!

Good thing we were forced to change our calling syntax to help us see the danger.

### Modified Again

Another transform we could have done is re-write `query` as a generator itself allowing for deep coroutines with `function*` at every definition and `yield*` at every call.

<generators-vs-fibers/generator-query.js>

In this case we insert a delegating `yield*` instead of a plain `yield` and it works the same as the previous change.

<generators-vs-fibers/generator-server.js#generator-handler>

In summary, generators allow for all kinds of nice tricks where you can block on I/O without actually blocking the process, however these require invasive changes to your code (much the same as callbacks act today).

## Fibers - Powerful, but Flexible

Long before generators landed in V8 and node.js, Marcel released a library known as [node-fibers][].  This clever little library allows you to use full coroutines in any version of node that the addon compiles against.

I'll repeat the same examples here, but using fibers instead of generators for easy comparison.

### The Server

Our server is slightly different because the fiber API is quite different than the gen-run and generator APIs.

<generators-vs-fibers/fiber-server.js#server>

We create a fiber for our code to run in.  With fibers there is no distinction between generators, iterators, or normal functions.  They are all just vanilla functions.  Also this means there is no `yield` or `yield*`.  Only normal function calls.

Also within the body of the fiber, `try..catch` works just like it does with sync code because the code *is* blocking within this fiber.

### The Handler

We'll start out again with a simple handler.  We'll use the same exact `query` function from before and the same `handleRequest` except this one is a plain function.

<generators-vs-fibers/fiber-server.js#handler>

The world is great, everything works and there is no race condition because nobody actually ever suspends the fiber.

### The Change

Now again, imagine that some time down the line, the authors of the query function need to perform some I/O to accomplish its task.  Well in this case they know they are running inside a fiber. (And even if they didn't know this, they could detect it).

So the only code change required to make query block on I/O is local to the query function.

<generators-vs-fibers/fiber-query.js>

That's it.  The rest of the code will continue to work as before.  You test it locally and everything works great.  You didn't have to change the signature of any other function that consumed this library.

Then you push this code to production where the server hits a higher concurrency load and people start complaining that their `requestCount`s aren't always accurate.  The problem you discover after many hours of painful debugging is that the `query` function back in `handleRequest` that didn't need to be changed syntacticly did change behavior.  It suspended the fiber and let other concurrent requests clobber the shared `requestCount` variable.

## Lesson Learned

Next time you complain that adding an async feature to a library causes all consumers of this API to be changed as well, remember that along with that pain is protection.  You can't have the protection without the pain.

Both styles of coroutines are powerful with unique strengths and weaknesses.

Safety or flexibility, choose one.

[node-fibers]: https://github.com/laverdet/node-fibers
[gen-run]: https://github.com/creationix/gen-run
[credits]: https://github.com/creationix/gen-run/blob/master/README.md#credits
