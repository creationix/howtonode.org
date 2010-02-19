Title: Prototypal Inheritance
Author: Tim Caswell
Date: Tue Feb 09 2010 13:44:09 GMT-0600 (CST)

In almost all modern programming languages we use the concept of Object Oriented Programming (OOP) to help manage the complexity of today's software.  The biggest challenge in modern software is in fact managing the complexity of it.

Most languages do this with a variant OOP called Classical OOP.  This is the one you see in Java, C#, C++, PHP, Ruby, and Python.  It has the idea that classes should be separate from instances.  Classes hold behavior and instances hold data.

While this is a great abstraction, I would like to experiment with other ideas.  Prototypal inheritance gets rid of the distinction between class and instance, between constructor and method.  It's just objects with inherited and local properties.

## So what does JavaScript have? ##

From what I hear (I wasn't there at the time), JavaScript was initially a prototypal inheritance system.  It was super simple like the rest of the language.  But then Netscape decided to make it be more like Java and added the idea of constructors to the language. Hence pseudo classes were born.

### Classical OOP

    function Person(name) {
      this.name = name
    }
    Person.prototype = {
      greet: function () {
        return "Hello world, my name is " + this.name;
      }
    };

    var frank = new Person("Frank Dijon");
    var message = frank.greet();
    // message is now "Hello world, my name is Frank Dijon"

Here we have a class like object `Person`.  Actually it's just a regular JavaScript function, but that's how it works, there are no real classes.  There are many ways to emulate classical OOP, but the most straightforward and the one designed into the language is this pattern.  Only functions can have prototypes and prototypes hold instance methods.  Then instances are `new` instances of the function which is now dubbed a constructor.

### Prototypal OOP

I don't like the `new` keyword, it overloads the meaning of functions and is dangerous.  If we were to say `frank = Person("Frank")`, then `this` inside the function would now be the global `this` object, not the new instance! The constructor would be overriding all sorts of global variables inadvertently.  Also bad things happen if you `return` from a constructor function.

Instead try this on for size:

    var Person = {
      greet: function () {
        return "Hello world, my name is " + this.name;
      }
    };
    var frank = Object.create(Person);
    frank.name = "Frank Dijon";
    var message = frank.greet();
    // message is now "Hello world, my name is Frank DiJon"

`Object.create` is new to JavaScript (it's part of [ES5]), but [node supports it][] so we can safely use it.  This creates a new object that inherits from another object.  `Object.create` actually can set properties right away, but the syntax is rather verbose:

    var frank = Object.create(Person, {name: {value: "Frank Dijon", enumerable: true}})

There is more you can set, but `value` and `enumerable` are the interesting ones.  What `enumerable` does is tell operators like `for ... in` if they should enumerate over that key.  When you set a property directly, it's enumerable property is set to `true` automatically.  `Object.create` actually defaults to false, so we could write this as:

    var frank = Object.create(Person, {name: {value: "Frank Dijon"}})

Just make sure you understand that most functions like `sys.inspect` and `JSON.stringify` won't show the name property of frank now that it's hidden.  If you pass `true` as the second argument to `sys.inspect`, it will show hidden properties using `Object.getOwnPropertyNames`.

    sys.puts(sys.inspect(frank));
    // {}
    sys.puts(sys.inspect(frank, true));
    // {
    //  [name]: "Frank Dijon"
    // }

## Using `Object.spawn`

While Object.create is nice, it's still too verbose for my taste.  On my projects I made a new function called `Object.spawn`.  Here is the source for reference:

    Object.spawn = function (parent, props) {
      var defs = {}, key;
      for (key in props) {
        if (props.hasOwnProperty(key)) {
          defs[key] = {value: props[key], enumerable: true};
        }
      }
      return Object.create(parent, defs);
    }

Then you can create hierarchies of objects easily:

    var Animal = {
      eyes: 2,
      legs: 4,
      name: "Animal",
      toString: function () {
        return this.name + " with " + this.eyes + " eyes and " + this.legs + " legs."
      }
    }
    var Dog = Object.spawn(Animal, {
      name: "Dog"
    });
    var Insect = Object.spawn(Animal, {
      name: "Insect",
      legs: 6
    });
    var fred = Object.spawn(Dog);
    var pete = Object.spawn(Insect);
    puts(fred);
    puts(pete);

The output would be:

    #!html
    Dog with 2 eyes and 4 legs.
    Insect with 2 eyes and 6 legs.

## Using `Object.prototype.spawn`

If you're really brave and don't mind messing with `Object.prototype`, then there is an even shorter way:

    Object.prototype.spawn = function (props) {
      var defs = {}, key;
      for (key in props) {
        if (props.hasOwnProperty(key)) {
          defs[key] = {value: props[key], enumerable: true};
        }
      }
      return Object.create(this, defs);
    }

Which is used as:

    var Animal = {
      eyes: 2,
      legs: 4,
      name: "Animal",
      toString: function () {
        return this.name + " with " + this.eyes + " eyes and " + this.legs + " legs."
      }
    }
    var Dog = Animal.spawn({
      name: "Dog"
    });
    var Insect = Animal.spawn({
      name: "Insect",
      legs: 6
    });
    var fred = Dog.spawn({});
    var pete = Insect.spawn({});

Just make sure to understand that adding enumerable properties to Object.prototype breaks all `for ... in` loops that don't have a `hasOwnProperty` check in them.  You've been warned.

## Where do we go from here?

I'm not sure if this is a good idea or not.  You give up a lot by not having constructor functions that initialize state of objects.  It could be baked into the `Object.spawn` method, but then you're dealing more with classical OOP emulations.

I plan on using this technique with some upcoming projects. I'm not sure what will come of it.

You can see the full source of `Object.spawn` and `Object.prototype.spawn` on [github][].

[github]: http://github.com/creationix/howtonode.org/tree/master/articles/prototypal-inheritance
[node supports it]: http://wiki.github.com/ry/node/ecma-5mozilla-features-implemented-in-v8
[ES5]: http://www.ecma-international.org/publications/standards/Ecma-262.htm