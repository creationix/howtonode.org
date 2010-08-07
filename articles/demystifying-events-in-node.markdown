Title: Demystifying events in node.js
Author: Kenny Shen
Date: Sun Aug 08 2010 01:48:53 GMT+0800
Node: v0.1.102

Ok, here's an important thing to understand when you're working with node.js. There're lots of node objects that emit events, and you can easily find some examples on the documentation. But what's not really clear perhaps is how do you write your own events and listeners. You could get by for a while without this, but then you'll soon reach a wall. So how do you write them? The important friend you need to know first of all is the 'events' module in node.js.

## The quick overview

To access this module, you simply add this to your js file:

> require('events')

> requires('events').EventEmitter

Specially, the docs will tell you the later is that all objects that emit events are basically instances of the latter. Let's create a simple dummy,

<demystifying-events-in-node/dummy.js>

The important part here is that we're extending our object with EventEmitter, and thus inheriting all the prototype objects,methods...etc from it.

So now let's assume Dummy needs to have a method call cooking(), and once he puts the chicken to roast, he wants an event to be emitted, e.g. 'cooked', and fire a callback call 'eat'. (yum, roast chix! :P)

<demystifying-events-in-node/dummy-cooking.js>

So we're done with this module. Let's say we want to use it in our main script,

<demystifying-events-in-node/dummy-node.js>

So basically, node.js runs through the couple of lines and then waits for the event 'cooked' to be emitted, upon which it then fires off the callback while passing it the returned argument(s).

## Where to go from here

It's worthy to note that "sub-classing" in the examples given here are a bit of an overkill, as well as using events.EventEmitter for things that only fire one event once. It's probably better to put the new methods on the instance if there's only going to be a few of them and for firing a low level of events, you might want to use asynchronous functions instead.

Regarding events.EventEmitter, there's a special event that you want to note - 'error'. This is fired whenever an error is encountered, and is special in the sense that if no listeners are attached it, node will throw an exception and terminate the execution. (thanks to Tim for highlighting this.)

## Before I go eat my chix...

The docs has some good runthrough, and I helped myself by searching through my favorite libraries and looking at how others implemented it, and also received some good answers that helped clear this up after posting to the mailing list. I suggest taking a read of Tim Caswell's articles for a better insight to all this node-ty stuff:

[Control Flow in Node Part 2](/control-flow-part-ii)

[What is "this"?](/what-is-this)

In the meanwhile, you can also view my crazy goofy sketch of a ircbot + logger + real-time websockets + search enabled bot mashup in node.js - [tocho](http://github.com/kennyshen/tocho)! I had a lot of fun making him, and while I haven't posted the search feature to the demo site, you can lurk through the #node.js irc channel with a web sockets enabled browser in real-time [here](http://northpole.sg/3Z).

Hope you found this article useful, and do comment below if you have any suggestions on adding to this (I'm sure I might have missed out something)