Title: Learning Javascript with Object Graphs (Part II)
Author: Tim Caswell
Date: Mon Oct 11 2010 08:24:25 GMT-0700 (PDT)
Node: v0.6.14

The first article using graphs to describe JavaScript semantics was so popular that I've decided to try the technique with some more advanced ideas.  In this article I'll explain three common techniques for creating objects.  They are constructor with prototype, pure prototypal, and object factory.

My goal is that this will help people understand the strengths and weaknesses of each technique and understand what's really going on.

## Classical JavaScript Constructors

First let's create a simple constructor function with a prototype.  This is the closest thing to a class you're going to find in native JavaScript.  It's extremely powerful and efficient, but doesn't quite work like you would expect if coming from a language with classes.

<object-graphs-2/classical.js#rectangle>

Now let's define a new class of objects called Squares that inherit from Rectangles.  To do inheritance, the constructor's `prototype` has to inherit from the parent constructor's `prototype`.  Here we're overriding `getPerimeter` to make it slightly more efficient and to show how to override functions.

<object-graphs-2/classical.js#square>

Usage is straightforward.  Just create an instance of each and call a function on each.

<object-graphs-2/classical.js#test*>

This is the resulting data structure.  Dashed lines mean object inheritance.

![classical](object-graphs-2/classical.dot)

<br style="clear:left"/>

Notice that there is little difference between the `rect` instance and `Square.prototype`.  They are both simply objects that inherit from `Rectangle.prototype`.  JavaScript is just a series of linked objects when you get down to it.  The only objects that are special are functions in that they take parameters and can hold executable code and point to scopes.

## Pure Prototypal Objects

Let's do the same example, but without using constructor functions.  This time we'll just use plain prototypal inheritance.

Let's define a Rectangle prototype that the base pattern for all our objects.

<object-graphs-2/prototypal.js#rectangle>

Now let's define a sub-object called Square that overrides some of the properties to change the behavior.

<object-graphs-2/prototypal.js#square>

To create actual instances of these prototypes, we simply create new objects that inherit from the prototype objects and then set their local state manually.

<object-graphs-2/prototypal.js#test*>

Here is the resultant graph of objects.

![classical](object-graphs-2/prototypal.dot)

<br style="clear:left"/>

This isn't quite as powerful as the constructor + prototype method, but is often much easier to understand since there is less indirection.  Also if you come from a language that has pure prototypal inheritance, you'll be happy to know it's possible in JavaScript too.

## Object Factories

One of my favorite methods for creating objects is to use a factory function.  The difference is that instead of defining a prototype object with all my shared functions and then creating instances of those, I simply call a function that returns a new object every time.  

This example is a super simple MVC system.  The controller function takes in as parameters the model and view objects and outputs a new controller object.  All state is stored in the closure via the scope.

<object-graphs-2/factory.js#controller>

To use this, simply call the function with the desired parameters.  Notice how we can use these directly as event handlers (setTimeout) without having to first bind the function to the object.  Since it (the function) doesn't use `this` internally, there is no need to mess with the value of `this`.

<object-graphs-2/factory.js#usage>

    // Output
    View now has 5
    View now has 6
    View now has 5
    Saving value 5 somewhere
    Now hiding view

Here is the object graph that results from this code.  Notice that we have access to the two passed in anonymous objects via the hidden `[scope]` property of the functions.  Or in other words, we have access to `model` and `view` from the closure created by the factory function.

![factory](object-graphs-2/factory.dot)

<br style="clear:left"/>

## Conclusion

There is so much more I want to explore, but I like to keep these articles somewhat short and bite-size.  If there is demand, I'll write a part three explaining how to do ruby-style mixins and other advanced topics.
