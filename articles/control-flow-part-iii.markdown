Title: Control Flow in Node Part III
Author: Tim Caswell
Date: Mon Feb 15 2010 09:21:11 GMT-0600 (CST)
Node: v0.1.102

While working on my quest to make async programming easier, or at least bearable, I discovered that often in programming you work with a set of data and want to do things on all the items in that set at once.

This article will explain a way to do async `filter` and `map` functions where the callback to `map` or `filter` is an async operation itself.  I will compare the simple task of reading all the files in a directory into memory in both sync and async style programming.

**UPDATE** This article has been heavily updated to use callbacks and new node APIs.  See the past revisions in the panel to the right for the original Promise/Continuable based article.

## The Blocking Way

In a synchronous programming language where I/O is blocking, this task is very straightforward and can be done in node as long as you understand the consequences.  Node exposes `Sync` versions of many of it’s I/O functions for the special cases where you don’t care about performance and would rather have the much easier coding style (like server startup).

For this example we will need three methods from the `fs` package.  We need `readdir` to get a listing of files in a directory, `stat` to test the results (we only want files, not directories), and `readFile` to read the contents to memory.

Solving the problem is very straightforward using sync style coding:

<control-flow-part-iii/sync-loaddir.js>

Since the commands are sync we are able to use the built in `filter` and `map` from `Array.prototype` on the array returned by `fs.readdirSync`.

This is extremely easy to code, but has dangerous side effects.  The program waits while waiting for the blocking `fs` operations to finish.  Since CPUs are very fast compared to other hardware (like hard-drives), then the cpu is wasted when it could be busy working on requests for another client if this was part of a hot running event loop.

Obviously this is not optimal.  Nothing is done in parallel.  Many CPU cycles are wasted.

## The Non-Blocking Way

They say that in computer science there is always a give and take when comparing different algorithms.  The pro to synchronous coding style is that it’s very easy to read and write.  The con is that it’s very inefficient.  That’s why most programming languages need threads to achieve any level of concurrency, but node is able to do quite a bit on a single threaded platform.

(Yes I’m aware of coroutines, but in JavaScript where everything is so mutable, they don’t work well and are about the same as multi-threading complexity wise. See [the archives] for information on Node’s experiment with this idea)

To make the comparison simple, I’ll do the same thing, but using non-blocking apis and callbacks. An initial implementation of our `loaddir` function would be this:

<control-flow-part-iii/async-loaddir.js>

Yikes! That is almost four times as long and indented several times deeper.  I know it’s a trade-off, but at this point I’m thinking I’ll return to [Ruby][] with [clusters of servers][] on the backend to handle concurrency.

### Map and Filter Helpers for Async Code

Since map and filter are common tasks in programming and that’s what we really want here, let’s write some helpers to make this beast of code a little smaller.

Here is a `map` helper. It takes an array, a filter function, and a callback.  The filter function itself it an async function that takes a callback.

<control-flow-part-iii/helpers.js#map>

And here is a filter helper.  It works the same, but removes items that don’t pass the filter.

<control-flow-part-iii/helpers.js#filter>

Now with our helpers, let’s try the async version again to see how much shorter we can make it:

<control-flow-part-iii/async-loaddir2.js>

That code is much shorter and easier to read.  Since `fs.readFile` and our `callback` are themselves async functions following the node convention, we can use them directly as the second and third arguments to the `helpers.map` call.  There is benefit in this common pattern.

Also, now that the code is executing in parallel, we can issue a stat call for all the files in a directory at once and then collect the results as they come in.  But with this version, not a single `readFile` can execute until all the `stat` calls finish.  In an ideal world, the program would start reading the file as soon as it knows it’s a file and not a directory.

### Combined Filter and Map Helper

Often you will want to filter and then map on the same data set.  Let’s make a combined `filterMap` helper and see how it helps:

<control-flow-part-iii/helpers.js#filtermap>

Now with this combined helper, let’s write a truly parallel `loaddir` function:

<control-flow-part-iii/async-loaddir3.js>

Here we will issue all the `stat` commands at once, and as they come back, check to see if it’s a file and if so, then fire off the `readFile` command right away.  If not we’ll output the result of `undefined` signifying to `filter_map` that we’re not interested in that entry.  When the `readFile` command comes back we’ll send the file contents to the helper.  When all the items have either sent `undefined` or some text, then the helper knows it’s done and gives us the result.

## Conclusion and Source Code

While it is a tradeoff in code complexity vs performance, with a little thinking and some good libraries, we can make async programming manageable enough to be understandable while taking full advantage of the parallel nature of non-blocking IO in node.

All source code used in these examples is linked to on the right side of the page or in the upper-right corner of the code snippets.

**UDATE** I’ve since made a general purpose callback library called [Step].  While it doesn’t include map and filter helpers, it does have the more useful parallel and group helpers.

[Ruby]: http://www.ruby-lang.org/
[clusters of servers]: http://unicorn.bogomips.org/
[the archives]: http://groups.google.com/group/nodejs/search?group=nodejs&q=wait
[Step]: /step-of-conductor