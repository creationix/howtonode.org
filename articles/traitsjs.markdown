Title: Creating safe and composable 'mixins' with traits.js
Author: Tom Van Cutsem
Date: Tue Nov 9 2010 20:08:54 GMT+0100

In this article I will introduce [_traits.js_](http://traitsjs.org), a small library to define, compose and instantiate traits. Traits are reusable sets of properties and form an alternative to multiple inheritance or mixins.

## Traits for Javascript

A common pattern in Javascript is to add ("mixin") the properties of one object to another object. _traits.js_ provides a few simple functions for performing this pattern safely as it will detect and report conflicts (name clashes) created during a composition. Also, a trait can specify that it can only be added to an object that defines certain required properties, and will fail to compose if these requirements are not satisfied.

There exist many libraries that add trait support to Javascript in one way or another. What makes _traits.js_ different?

- It is minimal. _traits.js_ introduces just a handful of methods to create, combine and instantiate traits. Moreover, it doesn't try to introduce the concept of a "class" in Javascript. _traits.js_ reuses Javascript functions for the roles traditionally attributed to classes. A class is just a function that returns new trait instances.
- It reuses and extends the [property descriptor](http://ejohn.org/blog/ecmascript-5-objects-and-properties/) format, introduced in ECMAScript 5th edition for describing objects using `Object.create`, as the format for representing traits. This has two implications: first, it means _traits.js_ traits can be used as an argument to ES5 built-ins such as `Object.create`. Second, it means _traits.js_'s own functions, described later, can operate on standard ES5 object descriptions, as composed from the return value of built-ins such as `Object.getOwnPropertyDescriptor`.
- It embraces a functional programming style: the core of _traits.js_ consists of a handful of "trait combinator" functions, which take traits as their argument and return new traits. These combinators are pure functions: they have no side-effects and do not modify their argument values, instead producing fresh traits upon each invocation. You can compose these functions freely without fear of unanticipated side-effects.

### Getting started

_traits.js_ is available as a node package called "traits" via npm. A simple `npm install traits` should make it available in node.js. Then load it up as follows:

    var Trait = require('traits').Trait;
    
This creates a local copy of the library's single exported variable, `Trait`. Evaluating `Trait` in the shell reveals the library's entire API:

    { [Function: Trait]
      required: { toString: [Function] }
    , compose: [Function: compose]
    , resolve: [Function: resolve]
    , override: [Function: override]
    , create: [Function: create]
    , eqv: [Function: eqv]
    , object: [Function: object]
    }

### Trait creation

As you can see from the above printout, `Trait` is a function. Calling it creates new traits. Here's a simple trait that abstracts equality (I will be using a slightly adapted version of the running example from the [original traits paper](http://scg.unibe.ch/archive/papers/Scha03aTraits.pdf)):

    var TEquality = Trait({
       equals: Trait.required,
      differs: function(x) { return !this.equals(x); }
    });

By convention, we usually prefix traits with a capital T to distinguish them from regular Javascript constructor functions. Traits may _require_ and _provide_ a set of properties. Provided properties are simply those properties that will be mixed into an object using the trait. Required properties are those that a trait expects to be provided by its "client" (the object that uses it). In _traits.js_, required properties are defined by binding the property name to the singleton value `Trait.required`.

`TEquality` provides a `differs` property to and requires an `equals` property from its client. Note that `differs` is implemented in terms of `equals`, and that it assumes that `this` has an implementation for it. This should all be fairly familiar to any object-oriented programmer. To relate traits to more traditional OOP concepts, it is not far wrong to think of a trait as an abstract class, and to think of its required properties as "abstract" properties, to be provided by a "subclass".

### Composing traits

The workhorse of the _traits.js_ library is a function called `Trait.compose`. This function takes any number of traits as an argument and returns a single, fresh, "composite" trait that contains all of the properties of its arguments. Consider the following trait:

    var TMagnitude = Trait.compose(TEquality, Trait({
      smaller: Trait.required,
      greater: function(x) { return !this.smaller(x) && this.differs(x) },
      between: function(min, max) {
        return min.smaller(this) && this.smaller(max);
      }
    }));
    
Give `TMagnitude` a concrete implementation for `smaller` and it will provide an implementation for the methods `greater` and `between`. Actually, `TMagnitude` is defined as a composite trait: it combines the properties of `TEquality` with those of an anonymous nested trait. This means that `TMagnitude` actually has two required properties: `smaller` and `equals`, and that it has three provided properties: `greater`, `between` and `differs`:

<img width="100%" src="/traitsjs/1-TMagnitude.png" title="TMagnitude" alt="Composition of TMagnitude"/>
  
Let's compose `TEquality` and `TMagnitude` further into a `TCircle` trait that captures generic circle behavior:

    function TCircle(center, radius) {
      return Trait.compose(
        TMagnitude,
        TEquality,
        Trait({
           center: center,
           radius: radius,
             area: function() { return Math.PI * this.radius * this.radius; },
           equals: function(c) { return c.center === this.center &&
                                        r.radius === this.radius },
          smaller: function(c) { return this.radius < c.radius }
      }));
    }

There are a couple of things going on here:

 -  `TCircle` is not defined as a singleton bound to a `var` but rather as a function. `TCircle` is in fact a trait generator: call it and you will get a new trait. By turning `TCircle` into a function, it can be parameterised with state, in this case the `center` and `radius` of the circle. The general rule is simple: if your trait is stateless, define it as a singleton object. If your trait is stateful, define it as a function.
 -  Like `TMagnitude`, `TCircle` is a composite trait, composed from the two traits we defined earlier, and a nested anonymous trait that adds the circle-specific behaviour. By composing `TEquality` and `TMagnitude`, circle objects created by this trait will be comparable using methods like `differs` and `greater`.
 -  `TCircle` provides an implementation for the methods required by `TMagnitude` and `TEquality`, such that `TCircle` will only provide and not require any properties.
 -  Even though `TMagnitude` also uses `TEquality`, the duplicated use of `TEquality` in `TCircle` does not cause any problems: _traits.js_ detects that the same trait is being composed and ignores the duplicated composition.
 
The following picture illustrates the composition of `TCircle`:

<img width="100%" src="/traitsjs/2-TCircle.png" title="TCircle" alt="Composition of TCircle"/>

Although this simple example doesn't do justice to it, here's the hidden power of `Trait.compose`: the ordering of its arguments _does not matter_. No matter in what order the argument traits are specified, `Trait.compose` will return an equivalent trait in all cases. For the mathematically inclined: `Trait.compose` is a commutative operator, like addition, e.g. `a + b = b + a`. Similarly, when using multiple nested calls to `Trait.compose`, it doesn't matter how the calls are nested. For the mathematically inclined: `Trait.compose` is an associative operator, like addition, e.g. `(a + b) + c = a + (b + c)`.

These properties sound like "nice to have" from a mathematical point of view, but they are actually crucial from a software engineering point of view: thanks to this commutativity and associativity, we as programmers don't need to understand in what order a trait was composed from its subparts, even in the case of a very complicated trait that involves a deep "hierarchy" of subtraits, possibly spread out over different files. It makes trait composition much more declarative than multiple inheritance, which requires you to do a mental graph traversal to figure out the relative interdependencies and priorities between the different superclass methods. Trait composition, at each level, "merges" the component parts into a single, larger, composite trait. All of the methods of all subparts have equal priority. But hold on, what if multiple traits define a property with the same name?

### Conflicts!

Assume we want to make our circles a bit more colorful and decide to mixin a color trait:

    function TColor(rgb) {
      return Trait.compose(TEquality, Trait({
        get rgb() { return rgb; },
        equals: function(col) { return col.rgb.equals(this.rgb); }
      }));
    }

`TColor`, like `TCircle`, is a "stateful" trait (i.e. it is defined as a function that can take parameters to capture state). We can imagine a color trait providing much more functionality to manipulate the RGB color, but for the sake of brevity the color trait provides just a simple accessor for the RGB value. `TColor` also reuses `TEquality` and defines `equals` in terms of equal RGB color values. Now, the definition of `TCircle` is modified to additionally reuse `TColor`:

    function TCircle(center, radius, rgb) {
      return Trait.compose(
        TMagnitude,
        TEquality,
        TColor(rgb),
        Trait({
           center: center,
           radius: radius,
             area: function() { return Math.PI * this.radius * this.radius; },
           equals: function(c) { return c.center === this.center &&
                                        r.radius === this.radius },
          smaller: function(c) { return this.radius < c.radius }
      }));
    }

Both `TColor` and `TCircle` provide an `equals` method. Which one will get invoked on an instance of `TCircle`? The answer is: neither one. When `Trait.compose` detects that two or more of its argument traits define a property with the same name, it records this "conflict" by defining a special "conflicting property" in the resulting trait. No exception is thrown at this stage (that will only happen if a trait containing a conflict is instantiated, as explained later). The resulting trait will contain a "conflicting property" but may still be composed further with other traits, as shown below:

<img width="100%" src="/traitsjs/3-Conflicts.png" title="Conflicts" alt="Conflicts in composition of TCircle"/>

### Three ways to resolve a conflict

Once we have detected a conflict, we will probably want to refactor the code to resolve it. The philosophy of traits is that it is the job of the *composer* to resolve conflicts. There are three ways in which the composer can do so:

 1.  by renaming the conflicting property name in one of the conflicting traits.
 2.  by excluding the property name altogether from one of the conflicting traits.
 3.  by explicitly overriding the properties of one trait with those of another trait.

The first two alternatives can be accomplished using the function `Trait.resolve`. Here's how one can resolve the conflict through renaming:

    function TCircle(center, radius, rgb) {
      return Trait.compose(
        TMagnitude,
        TEquality,
        Trait.resolve({ equals: 'equalColors' }, TColor(rgb)),
        Trait({
           center: center,
           radius: radius,
             area: function() { return Math.PI * this.radius * this.radius; },
           equals: function(c) { return c.center === this.center &&
                                        r.radius === this.radius },
          smaller: function(c) { return this.radius < c.radius }
      }));
    }

The call `Trait.resolve({ a: 'b' }, t)` returns a trait that is equivalent to `t` but with `t.a` bound to `t.b` instead. In the above example, we've renamed the `equals` method provided by `TColor` to `equalColors`. This renamed trait is then composed with the other traits, producing a conflict-free `TCircle` trait, as shown below:

<img width="100%" src="/traitsjs/4-Renaming.png" title="Renaming" alt="Renaming"/>

The second alternative is to exclude a conflicting property, like so:

    function TCircle(center, radius, rgb) {
      return Trait.compose(
        TMagnitude,
        TEquality,
        Trait.resolve({ equals: undefined }, TColor(rgb)),
        Trait({
           center: center,
           radius: radius,
             area: function() { return Math.PI * this.radius * this.radius; },
           equals: function(c) { return c.center === this.center &&
                                        r.radius === this.radius },
          smaller: function(c) { return this.radius < c.radius }
      }));
    }

The call `Trait.resolve({ a: undefined }, t)` will return a trait equivalent to `t` with `a` turned into a required property:

<img width="100%" src="/traitsjs/5-Excluding.png" title="Excluding" alt="Excluding"/>

The third alternative is for the composer to explicitly specify that one of the traits overrides the properties of another trait:

    function TCircle(center, radius, rgb) {
      return Trait.compose(
        TMagnitude,
        TEquality,
        Trait.override(
          Trait({
             center: center,
             radius: radius,
               area: function() { return Math.PI * this.radius * this.radius; },
             equals: function(c) { return c.center === this.center &&
                                          r.radius === this.radius },
            smaller: function(c) { return this.radius < c.radius }
          }),
          TColor(rgb)));
    }
    
The anonymous trait and `TColor` are now composed using `Trait.override` instead of `Trait.compose`. Because of this, the `equals` method of the anonymous trait will take precedence over the `equals` method of `TColor`:

<img width="100%" src="/traitsjs/6-Overriding.png" title="Overriding" alt="Overriding"/>

Note that the order of arguments to `Trait.override` matters (left-to-right priority), which is why the two traits have been reordered compared to the previous examples. This also exposes a significant drawback of `Trait.override` compared to `Trait.compose`: it's not commutative, so you'll have to pay closer attention to the ordering of things! `Trait.override` is very similar to "standard" inheritance (with the subclass's methods implicitly overriding the superclass's methods).

### Trait instantiation

Traits can be instantiated into objects using the function `Trait.create`:

    function Circle(center, radius, rgb) {
      return Trait.create(Object.prototype,
                          TCircle(center, radius, rgb));
    }

The first argument to `Trait.create` is the _prototype_ of the trait instance. `Trait.create` is modelled after the new ES5 built-in `Object.create`, which also takes the object's prototype as its first argument. In fact, it's possible to use `Object.create` to instantiate traits as well:

    function Circle(center, radius, rgb) {
      return Object.create(Object.prototype,
                           TCircle(center, radius, rgb));
    }

<img width="100%" src="/traitsjs/7-Create.png" title="Create" alt="Instantiating traits"/>

Now we can start creating and using circle objects:

    var c1 = Circle(new Point(0,0), 1, new Color(255,0,0));
    var c2 = Circle(new Point(0,0), 2, new Color(255,0,0));
    c1.smaller(c2) // true
    c1.differs(c2) // true

`Object.create` is provided as a built-in in an ES5 engine. On ES3 engines, _traits.js_ defines it. Next, let's look at how instantiating traits using `Trait.create` and `Object.create` differ.

#### Using Trait.create

When instantiating a trait, `Trait.create` performs two "conformance checks":

- If the trait still contains required properties, and those properties are not provided by the specified prototype, `Trait.create` throws. This situation is analogous to trying to instantiate an abstract class.
- If the trait still contains conflicting properties, `Trait.create` also throws.

In addition, _traits.js_ ensures that the new trait instance has high integrity:

- The `this` of all trait methods is bound to the new instance. This means you can safely select methods from a trait instance and pass them around as functions, without fear of accidentally binding `this` to the global object.
- In an ES5 engine, the instance is created as a _frozen_ object: clients cannot add, delete or assign to the instance's properties.

#### Using Object.create

Since `Object.create` is an ES5 built-in that knows nothing about traits, it will not perform the above trait conformance checks and will not fail on incomplete or inconsistent traits. Instead, required and conflicting properties are treated as follows:

- Required properties will be bound to `undefined`, and will be non-enumerable (i.e. they won't show up in `for-in` loops on the trait instance). This makes them virtually invisible. Clients can still assign a value to these properties later.
- Conflicting properties have a getter and a setter that throws when accessed. Hence, the moment a program touches a conflicting property, it will fail, revealing the unresolved conflict.

`Object.create` does not bind `this` and does not generate frozen instances. Hence, the new trait instance can still be modified by clients.

It's up to you as a programmer to decide which instantiation method, `Trait.create` or `Object.create` is more appropriate: `Trait.create` fails on incomplete or inconsistent traits and generates frozen objects, `Object.create` may generate incomplete or inconsistent objects, but as long as a program never actually touches a conflicting property, it will work fine (which fits with the dynamically typed nature of Javascript).

## Conclusion

In the introduction I mentioned that _traits.js_ is minimal. All in all, you only need to know four functions to work with the library:

- Use `Trait({...})` to construct a new trait.
- Use `Trait.compose` to compose smaller traits into larger ones.
- Use `Trait.resolve` to create a trait with renamed or excluded properties, in order to avoid conflicts and disambiguate property names.
- Use `Trait.create(prototype, trait)` to instantiate a trait into a new object. If you require the trait instance to remain extensible, use `Object.create` instead.

That's it. There isn't much more to it. The complete API and another tutorial can be found on the [_traits.js_ home page](http://traitsjs.org). If you want to peek under the hood of the library and know more about the format in which traits are represented, [this page](http://code.google.com/p/es-lab/wiki/Traits#Traits_as_Property_Maps) provides all the details.