Wait.for
=======

Node.js unavoidable style is to make everything that could **even begin to think about blocking** into an async function. 
This is a core node trait. You can't avoid it, you can't side-step it, Node will not forgive you.  

But... wouldn't be great to be able to call all this great async functions in a sequential/sync mode when the need arises? 

Specially the need not to fall into callback hell?

I believe async is great, and obviouslly there are no other way to program blocking or long-running functions in Node. 
But sometimes, when you're coding business DB access logic, as example, 
a sync-non blocking mode to call asnyc functions is very handy.

That's why I've developed a very small, simple lib called ***wait.for***, -I mean ***simple***, not future promises, I mean ***simple*** now. - ;)

Wait.for, as it name imples, bassically provides the programmer with a ***wait.for*** function.

What does wait.for does?
--

wait.for waits for the async function to callback, before continuing to the next line, and it does it WITHOUT blocking node.

I've developed two versions of ***Wait.for*** based on different thechonolgies under the hood.

* one is [wait.for based on node-fibers](https://github.com/luciotato/waitfor) (github repo)

* other is [wait.for based in the upcoming ES6-Harmony generators](https://github.com/luciotato/waitfor-ES6) (github repo)

I've coded [wait.for based on node-fibers](https://github.com/luciotato/waitfor), two weeks ago. 
After publishing it, several people ask me: "why not base it on ES6-Harmony generators?". So I started looking for information on such a migration. 
After a quick search, the migration did not seem possible:
(According to this: http://stackoverflow.com/questions/18293563/can-node-fibers-be-implemented-using-es6-generators
and this: http://calculist.org/blog/2011/12/14/why-coroutines-wont-work-on-the-web)

However, the basic building blocks of ES6 generators are the same for the concept of fibers, 
so I started trying to port **wait.for** to ES6...

It didn't looked good, ***but it went much better than expected!***

***The funny thing is***, the implementation of the core function ***wait.for(async,arg...)***, using ES6 generators is:

```javascript
wait.for = function( asyncFn ) { return arguments; }
```
Yes, just return arguments.

Compare it to **wait.for** based on node-fibers:

```javascript
wait.for = function(asyncFn){ 
        var newargs=Array.prototype.slice.call(arguments,1); // remove function from args
        return Wait.applyAndWait(null,fn,newargs); 
    }
```

**wait.for** based on node-fibers *actually does something*: calls ***Wait.applyAndWait***, which in turn uses node-fibers to handle the async call. 

In contrast ES6 based implementation of **wait.for(asyncFn)** does basically nothing 
(the magic control flow resides in ***yield***)

You can use ***wait.for*** inside a generator (function*) in conjunction with new JS/ES6 ***yield*** keyword, as in:

```javascript
var data = yield wait.for ( fs.readFile, '/etc/somefile' );
```

<h2>Surprisingly, ES6 generators-based implementation of <i>function wait.for(asyncFn)</i> 
is almost a no-op, you can even completely omit it calling it...</h2></blockquote>

Given that evaluating ***wait.for*** return its arguments, the call can be replaced with an object literal, which is an array-like object. It results that:
```javascript

wait.for( asyncFn, arg1, arg2 )  // return arguments
=== {0:asyncFn, 1:arg1, 2:arg2 } // is equivalent to...
~= [ asyncFn, arg1, arg2 ] // is similar to...
```
so, the following two snippets are equivalent (inside a generator launched via ***wait.launchFiber(generator)***):

```javascript
// call an async function and wait for results, (wait.for syntax):
console.log( yield wait.for ( fs.readFile, '/etc/somefile', 'utf8' ) );

// call an async function and wait for results, (fancy syntax):
console.log( yield [ fs.readFile, '/etc/passwd', 'utf8' ] );
```

Check both repositories:

* [wait.for based on node-fibers](https://github.com/luciotato/waitfor) 

* [wait.for based in the upcoming ES6-Harmony generators](https://github.com/luciotato/waitfor-ES6)


Advantages of wait.for
---

* Avoid callback hell / pyramid of doom
* Simpler, sequential programming when required, without blocking node's event loop (thanks to fibers)
* Simpler, try-catch exception programming. (default callback handler is: if (err) throw err; else return data)
* You can also launch multiple parallel non-concurrent fibers.
* No multi-threaded debugging nightmares, only one fiber running at a given time (thanks to fibers)
* Can use any node-standard async function with callback(err,data) as last parameter.
* Plays along with node programming style. Write your async functions with callback(err,data), but use them in sequential/SYNC mode when required.
* Plays along with node cluster. You design for one thread/processor, then scale with cluster on multicores.
