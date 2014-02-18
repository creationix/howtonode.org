Title: Creating Custom Modules
Author: Aaron Blohowiak
Date: Tue May 18 2010 13:37:07 GMT-0500 (CDT)
Node: v0.1.102

Node implements [CommonJS Modules 1.0](http://commonjs.org/specs/modules/1.0/). Node's [full API doc.](http://nodejs.org/api.html#modules-285) explains their use thoroughly, but can be a bit tricky to get started.

This tutorial explains the why and how you can use Node's module system to help structure your application.

## Creating a Module

A module is just a javascript file.  Put some JS in a file and BAM! you have a module.  Good show!

<creating-custom-modules/simplest-module-ever.js>

## Um, so why is there a tutorial?

Unfortunately, you won't be able to do anything with it just yet.

<creating-custom-modules/simplest-module-ever-test.js>

There's a good reason, and it has to do with playing well with others.  One of the biggest problems in JavaScript is name collisions.  Here's an example: You get one script that makes a cool date picker and another that does a day-by-day schedule and they both define a drawCalendar() function and now it all breaks and how the heck are you going to fix it?  This happens because both names are declared in what's called the global name space.

You know how I said that a module is just a javascript file? Well, that's true, but it is evaluated in a special way.  When Node loads your javascript file it creates a new scope, so your date picker plugin can't mess with my schedule plugin.  When you are in your module, you can't see the outside world; you can just do your own thing or require other modules.  As a result, you don't have to worry about clashing with other people's stuff.

## If you can't add to the global name space, then how do you share your code?

Inside your javascript file, there is a special object. When Node creates the new context for your module, it sprinkles some objects in there like a little salt and pepper.  The [official Global Objects API](http://nodejs.org/api.html#global-objects-40) hints at the answer, but seeing is much simpler.

<creating-custom-modules/simplest-module-ever-complete.js>

And now this will work the way we want.

<creating-custom-modules/simplest-module-ever-complete-test.js>


## Using Parts of Modules

The basic example on the [Node.JS Home Page](http://nodejs.org) shows you how to import whole modules.

When you want to use a port of a Module you use the require function like usual, but only save a reference to a member of the returned exports object:

    var inspect = require('sys').inspect;
    
This creates a local variable, 'inspect' and assigns it to the 'inspect' property of the sys module.

So now you can 

    inspect({Hello:"World"})
    
which is like `sys.inspect({Hello:"World"})` without having to type `sys.inspect` all the time.

Normal JavaScript function binding rules apply, so if you have any weirdness that you can't figure out, just import the whole module and use it like usual until you [Learn more about JavaScript Binding](http://www.robertsosinski.com/2009/04/28/binding-scope-in-javascript/)
