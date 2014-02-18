Title: Why use "closure"?
Author: Tim Caswell
Date: Wed Jun 30 2010 12:15:53 GMT-0700 (PDT)
Node: v0.1.102

One of the greatest features of the JavaScript language is [closure][wikipedia-closure].  I've discussed this concept some in the "[What is This?](/what-is-this)" article.  There I was explaining scope and context.  Today I wish to explain about some practical uses of a closure in event based programming as well as compare it to other methods like object orientation to preserve state across event calls.

## What is a closure

Again from wikipedia:

> In computer science, a closure is a first-class function with free variables that are bound in the lexical environment. Such a function is said to be "closed over" its free variables. A closure is defined within the scope of its free variables, and the extent of those variables is at least as long as the lifetime of the closure itself.

Or the way I understand it intuitively:

> A closure is a function defined within another scope that has access to all the variables within the outer scope.


## Using closure to hide state

Imagine this piece of code:

<why-use-closure/greet_plain.js*>

We're manually passing the internal state around so that the other functions can get ahold of it. I mean, it works and is really simple, but assuming you never need the generated message string outside of the `greet` function, what's the point of making the user of the API handle internal data for you.  Also what if later on the `greet` function needed some other data, you would have to change everything to pass along more variables.

Clearly there must be a better way.

My favorite use of closure is to  call a function that generates another function or group of functions but hides all the state in private variables within the closure:


<why-use-closure/greeter.js*>

Note that the `greet` function is nested within the `greeter` function.  This means it's within the lexical scope of `greeter` and thus according to the rules of closure has access to the local variables of `greeter` including `message`, `name`, and `age`.

## Using a closure instead of objects

Many people who come to JavaScript are experienced programmers who come from other languages where classes and instances are the common way to handle this encapsulation.  JavaScript has something similar in the form of constructor functions and function prototypes.

### Classical OO in JavaScript

Consider the following class, it uses a classical constructor with function prototypes to work like a class from other languages.

Since you're using the object itself as the place to store state, all references have to be prefixed with `this`.  It's impossible to hide any variables since everything that accessible to your methods is also publicly readable, writable, and even deletable.  Also if you have a function nested inside of anything then `this` will change on you unless it's explicitly passed through or preserved with a closure. (see the `slowGreet` method)

Define the class like this:

<why-use-closure/personclass.js>

And use it like this: 

<why-use-closure/useclass.js>

Nice clean OO code right?  The good thing is that you get to write your methods outside of the constructor instead of nested inside it.  This is a very comfortable pattern and is used by a lot of successful JavaScript projects.

### Object factories using closures

This is how I would write this class without using `new` and `prototype`.  I'll create a factory function that creates a closure and exposes parts of it as public methods.  Externally it looks a lot like the class based version, but internally it's 100% a closure and there isn't a `this` or `new` in sight.

Define the factory like this:

<why-use-closure/personfactory.js>

And use it like this:

<why-use-closure/usefactory.js>

I like it!  One word of caution though.  While this method is quite easy to use, it doesn't perform well when you're creating large numbers of instances.  Each instance will create its own version of every function in the object.

## Closures for events and callbacks

This is where closures are the most useful.  In fact, this is the reason that Ryan Dahl (The creator of node.js) used JavaScript in the first place.  C doesn't have closures and it makes non-blocking code difficult to write in C.

The simplest example (which we just saw earlier) is `setTimeout`.  This is a non-blocking function call.  The code in the passed in callback won't get called till after the timeout happens.  This will be on a completely new stack and the only way to get data into it is through lexical scope and a closure.

Imagine this code snippet:

<why-use-closure/settimeout.js>

This won't work, `message` will be undefined since it's a local variable to `setAlarm` and doesn't exist outside that function.  Instead we need to define the `handle` function inside of the `setAlarm` function.

<why-use-closure/settimeout2.js>

As explained in the "[What is This?](/what-is-this)" article, `this` is especially painful when dealing with setting callbacks.  This is because specifying a method of an object as the callback function will cause the function by itself to be the callback, not the object associated with it.

<why-use-closure/eventobj.js>

Interesting thing about JavaScript is that functions are first-class values.  The whole `this` context helps in designing classical OO API's, but you have to remember that it's only assigned on function call, it's not something tied to the function itself.  Variables from the closure, however are part of the function itself, no matter how it's called.


[wikipedia-closure]: http://en.wikipedia.org/wiki/Closure_(computer_science)