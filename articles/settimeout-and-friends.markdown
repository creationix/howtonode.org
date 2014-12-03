Title: setTimeout and Friends
Author: Peter Lyons
Date: Wed Dec 03 2014 08:49:22 GMT-0700 (MST)
Node: v0.10.33

So I was recently scheduled to do an [AirPair](http://airpair.com) pair programming session to help someone understand the various javascript functions available for asynchronous programming.

This topic is key to writing correct code both in node.js and the browser, but it is indeed easy to see how things can be quite confusing when first encountering a myriad of functions that all seem to basically do the same thing.

`setTimeout`, `setImmediate`, `process.nextTick`? Which one is best? What are the differences?

The basic concept at work here is normally in javascript your code executes "now" meaning line by line, one thing after another, until there's no more code. However, with a user interacting with the browser or with node.js code responding to HTTP requests, we need a way to ask the runtime to run some code "later".  And of course using event handlers we already have a mechanism to ask the runtime to execute our code "whenever X happens" where X is a mouse click, keystroke, etc in the browser or a database call returning in node.js.

So I went and researched this and put together what I hope to be a mostly comprehensive overview of all of the relevant functions and some of the tricky points to be aware of. The good news is mostly this stuff is actually pretty straightforward once you get the basic handle of it, and there are just a few key subtle gotchas that take a little more practice to wrangle.

## `setTimeout(functionToCall, msToWait)`
- Read the [window.setTimeout MDN docs](https://developer.mozilla.org/en-US/docs/Web/API/Window.setTimeout)
- works in browsers and node.js
- invoke the given function some time later, on a different tick of the event loop
- returns an opaque value (numeric ID) that can be later passed to `clearTimeout` to cancel the scheduled call
- subject to 4ms "clamping" in HTML5 spec (see MDN docs above) and this is even worse in old-IE. What this means if you write `setTimeout(makeCookies, 0)`, the browser will actually wait at least 4ms before invoking `makeCookies`. This use of `setTimeout` with zero delay is basically a hack since there is/was not `setImmediate` and can be easily abused, so browsers (and the actual specs) have deemed to throttle things by a few ms as a pragmatic compromise.


## `clearTimeout(timeoutID)`
- Read the [window.clearTimeout MDN docs](https://developer.mozilla.org/en-US/docs/Web/API/window.clearTimeout)
- works in browsers and node.js
- cancel a previous call to `setTimout`
- straightforward

## `setInterval(functionToCall, intervalMs)`
- Read the [window.setInterval MDN docs](https://developer.mozilla.org/en-US/docs/Web/API/window.setInterval)
- works in browsers and node.js
- similar to `setTimeout`, just calls function repeatedly
- inactive browser tabs may be throttled compared to active tabs
- Watch out for overlapping invocations. Use recursive `setTimeout` instead if work could take longer to complete than the delay interval (don't start the work again if you're not finished with the last batch of work yet). This is discussed in more detail in the MDN docs linked above.

## `clearInterval(intervalID)`
- same as `clearTimeout` just pairs with `setInterval` instead
- straightforward

## `process.nextTick(functionToCall)`
- works in node.js only, not standard for browsers
- Read the [process.nextTick docs](http://nodejs.org/docs/latest/api/all.html#all_process_nexttick_callback)
- Up to 1000 of these (configurable as `process.maxTickDepth`) will all happen in a row before any I/O is allowed to interject. Thus misusing `nextTick` can starve the system of I/O and cause performance degradation
- OK to use in code that has to work on node v0.8 or older, just be cautious to not do an onslaught of these that will cause your program to become I/O starved.
- But generally in node.js `setImmediate` should be preferred

## `setImmediate`
- works in node.js v0.10 or newer only, not standard for browsers (except IE10 and IE11)
- no `window` global object in node, so `setImmediate` can be directly called
- Read the [node.js setImmediate docs](http://nodejs.org/api/all.html#all_setimmediate_callback_arg)
- Read the [MDN window.setImmediate docs here](https://developer.mozilla.org/en-US/docs/Web/API/Window.setImmediate), which basically say "yeah this doesn't exist. Don't use it."
- schedules a function to be invoked after the rest of the javascript in the current tick runs, but before doing more I/O
- the main difference in node.js compared with `process.nextTick` is `setImmediate` will run your callback and then allow I/O (and the associated callbacks) to get a chance to run, and then move on to the next queued `setImmediate` callback
- [This demo](http://ie.microsoft.com/testdrive/Performance/setImmediateSorting/Default.html) explains the difference between `setTimeout` and `setImmediate` in Internet Explorer best

## `clearImmediate`
- works in node.js and IO only, not standard for browsers
- otherwise exactly analogous to `clearTimeout` and `clearInterval`
- straightforward
- [node.js docs](http://nodejs.org/docs/latest/api/all.html#all_clearimmediate_immediateobject)
- [MDN docs](https://developer.mozilla.org/en-US/docs/Web/API/Window.clearImmediate)

##"naming stuff is hard" --@izs

`setImmediate` happens on the NEXT tick.

`process.nextTick` happens on the SAME tick (usually, with caveat about `maxTickDepth`).

##Which one to use in node.js

Generally `setImmediate` is the best practice starting with node.js v0.10, so that's what you should use. However, if you need to support node v0.8, using `process.nextTick` is still fine. The whole problem of I/O starvation doesn't occur in most projects. It's only in certain types of code that are either misguided and poorly coded or truly have a weird edge case. For your run-of-the-mill node.js callback, either is just fine but `setImmediate` is better.


#Reference Articles
- [The node.js Timers documentation](http://nodejs.org/api/timers.html)
- [The Case for setImmediate](http://www.nczonline.net/blog/2013/07/09/the-case-for-setimmediate/)
- [setImmediate vs nextTick](http://stackoverflow.com/questions/15349733/setimmediate-vs-nexttick)
- [A cross-browser implementation of the new setImmediate API](https://github.com/NobleJS/setImmediate)
- [Designing APIs for Asynchrony](http://blog.izs.me/post/59142742143/designing-apis-for-asynchrony) - Isaac's blog post featuring the key phrase "**Do Not Release Zalgo**"
  - In this post Isaac refers strongly to [callbacks, synchronous and asynchronous](http://blog.ometer.com/2011/07/24/callbacks-synchronous-and-asynchronous/) by havoc



Isaac Schlueter's comment on **The Case for setImmediate**:

>I agree the point you’re making here, 100%. However, a slight correction about Node’s APIs.

>First of all, process.nextTick is actually first in, first out. Proof:

>$ node -e 'process.nextTick(console.log.bind(console, 1)); process.nextTick(console.log.bind(console, 2))'
>1
>2

>Second, process.nextTick isn’t quite the same as setImmediate, at least as of 0.10. Node has a setImmediate function which does happen on the next turn of the event loop, and no sooner. process.nextTick happens before the next turn of the event loop, so it is not suitable for deferring for I/O. It IS suitable for deferring a callback until after the current stack unwinds, but making sure to call the function *before* any additional I/O happens. In other words, every entrance to JS from the event loop goes like:

>Event loop wakes up (epoll, etc.)Do the thing that you said to do when that event happens (call
handle.onread or whatever)Process the nextTick queue completelyReturn to the loop

>setImmediate is something like a timer that schedules an immediate wake-up, but on the next turn of the event loop. (It’s been pointed out that they’re named incorrectly, since setImmediate is on the next “tick”, and process.nextTick is “immediate”, but whatever, naming stuff is hard, and we’re borrowing the bad name from the browser spec.)

>The difference may seem like a minor nit-pick, but it’s actually quite relevant. If you are recursively calling process.nextTick, then you’re never actually yielding to the event loop, so you’re not accepting new connections, reading files and sockets, sending outgoing data, etc.

>But that aside, yes. It is completely baffling to me that there is any resistance to this API in browsers, where it is so clearly an obvious win.


Thanks to [@derickbailey](https://twitter.com/derickbailey) and [@sambreed](https://twitter.com/sambreed) for reviewing and editing a draft this post.
