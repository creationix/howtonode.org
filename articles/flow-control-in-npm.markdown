Title: Flow Control in npm
Date: 2010-08-31T22:29:18
Author: Isaac Z. Schlueter
node: 0.2.0

Flow control is a popular subject in NodeJS.  Since most of us learned synchronous object-oriented programming patterns in school, it can be a bit of a shift to really leverage asynchronous functional programming for all it can do.

As it turns out, a great way to leverage huge chunks of the node API is to build a package manager.  npm has to do a lot of stuff with the file system, child processes, and HTTP requests to the registry.  Fetching and building packages is a lot of "laundry list" programming.  That is, the algorithms are very simple (fetch this file, put it over there, run that script, etc.), but there's a lot to do, and you've gotta make sure everything gets done right (and in the right order).

To keep this from getting out of hand, I've leveraged two fairly low-level patterns that are found throughout the NodeJS API, but which I haven't seen documented anywhere yet, and which I'm calling "the Action/Callback pattern".

## Action functions

Action functions can take a variable amount of arguments, but the *last* argument is always a callback function.  It MUST call that cb exactly one time, once it's done doing stuff.

## Callback functions

Callback functions can take any number of arguments, but the *first* argument is always an error or null.

## Example

You've probably seen this example:

<flow-control-in-npm/read-file-example.js>

`fs.readFile` is an action function.  The function being passed to it, `function (er, data)...` is a callback function.

## Consistent Patterns are Consistent

Every function in npm, if it does something async, does it using this mechanism.

Every callback function in npm, will expect an error argument as the first argument, so calling it like that will always bubble the error up.

## Polymorphism Wins

Because of this consistent pattern, there is a lot of room for powerful creativity.

### `asyncMap(list, fn, cb)`

Let's say you have a list of filenames, and you have to remove each one.  A pretty typical use case in npm, but once you generalize "do this to those", you start noticing nails in need of a hammer.

`asyncMap` is the answer for that.  (The current async-map.js in npm is a bit more complicated, because it allows you to specify a list of functions rather than just one.)

<flow-control-in-npm/async-map.js>

Note that the top-level `cb_` function is called with an array of all the results.  So, data is being proxied up, as well as errors.  (That's why it's called async**Map**, rather than async**ForEach**.)

So, now we can simply do this:

<flow-control-in-npm/remove-file-list.js>

### Proxying

You catch that?  An Action function can pass its own cb over to another Action function if it doesn't need to do anything with success or failure.  We could also have done something like this:

<flow-control-in-npm/proxying.js>

### `chain(fn1, fn2, ..., cb)`

There are other cases where you want to make sure that a list of functions are called in a specific order.  For instance, we need to make sure that all `preinstall` scripts are done running before starting in on the `install` scripts.  That's where `chain` comes in handy.

`chain` takes a list of function arguments which take a callback, and a final argument which is the ultimate callback function.

<flow-control-in-npm/chain.js>

### chain 2

This is great, but it requires using Function#bind if we want to pass arguments to those functions other than a callback.  This API would be nice:

<flow-control-in-npm/chain2-usage.js>

Basically, each argument is one of:

* a function which will be called with a single cb argument
* an array containing a function and 0 or more arguments
* an array containing an object, a method name, and 0 or more arguments
* a falsey value, so we can do stuff like:
     foo && [ doFoo, foo, bar ]

Revamped to handle this calling style, chain looks like this:

<flow-control-in-npm/chain2.js>

## Mix and Match

Because everything in npm (and a lot of things in node) use this pattern, you can mix very high-level operations with very low-level operations.  Why, even `chain` and `asyncMap` are "action" functions, so they can take any vanilla callback, or be arguments to one another.

This is without any sophisticated "async flow control" library.  Just a few short JavaScript functions and an adherence to a few simple patterns.

As long as you stick to these patterns, you can use any Action function in any asyncMap or chain call, and make sure that all Action functions call their cb exactly once.

Get creative!  This language is powerful, and it's not that hard to do interesting things with it.
