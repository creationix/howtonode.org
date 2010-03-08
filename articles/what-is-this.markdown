Title: What is "this"?
Author: Tim Caswell
Date: Mon Mar 08 2010 12:59:10 GMT-0600 (CST)

Most people that learn JavaScript are coming from a background in another language.  This brings with it a view of how the world works that may be different from how it really works in JavaScript.  For this and other reasons, JavaScript is often misunderstood.  It's not entirely out fault, the language was designed to work like one thing (scheme-like), but look like another (c-like).  This article will describe lexical scope and the "`this`" variable and how to control them rather than be controlled by them when in coding JavaScript.

## It's all about the scope.

In all programming languages, there is this idea of current scope.  Most languages have more than one type of local scope.  JavaScript is one of these.  The two main scopes in JavaScript are lexical scope and "`this`" scope.

In JavaScript all new scopes are created through "`function`" definitions.  But contrary to other c-like languages, this is the *only* way to make a new scope.  For loops don't do it, if blocks don't do it, plain curly braces assuredly don't do it.  This simplicity is both a blessing and a curse.  First let's have a couple of examples to explain creating scopes.

This is an example of global scope:

    // Define a couple of global variables
    var name = "Tim";
    var age = 27;

    // Access one of them from the global scope
    puts(name);

This is an example of local scope:

    // Create a couple of local variables in a function.
    function () {
      var name = "tim";
      var age = 27;
    }
    // Try to access the local variables from the global scope
    // This will cause an error.
    puts(name);

### Lexical Scope

Lexical scope is the key to making closures work.  Here's a quote from wikipedia about closures and lexical scope:

> In computer science, a closure is a first-class function with free variables that are bound in the lexical environment. Such a function is said to be "closed over" its free variables. A closure is defined within the scope of its free variables, and the extent of those variables is at least as long as the lifetime of the closure itself.

So what does all that mean, how about an example:

    var name = "outer";
    function () {
      var name = "middle";
      var other "findme";
      function () {
        var name = "inner"
        // Here `name` is "inner" and `other` is "findme"
      }
      // Here `name` is "middle" and `other` is "findme"
    }
    // Here `name` is "middle" and `other` is undefined.

Here we see that local variables in an inner scope can shadow variables by the same name in the outer scope.  But from the outside, variables in the inside don't exist.  Lexical scope is 100% based on the physical location of the variables in the nesting in the code.  It doesn't matter what path you might take to get to the inner function.  That's how closures are able to make inner variables usable.

    // Make a function that returns a closure function.
    function myModule() {
      var name = "tim", age = 27;
      return function greet() {
        puts("Hello " + name + ".  Wow, you're " + age + " years old.");
      }
    }
    // call `myModule` to get a closure out of it.
    var greeter = myModule();
    // Call the closure
    greeter();

The variables `name` and `age` are local to the `myModule` function, but when we call `greeter` from the global scope, it doesn't throw an error.  This is because the `greet` function has `name` and `age` in it's lexical scope and so they're accessible as if they were local variables.  Basically the way variable lookup works is that it goes up scope by scope looking for a variable by the requested name.


### "`this`" Scope

In addition to the lexical scope.  JavaScript adds another scope through the special variable "`this`".  This variable looks and acts like any other javascript variable.  If it's an object, you access it's properties the normal way by prefixing with "`this.`". The magic is that it's automatically set for you.  In OOP terms, it's the receiver of the method you're in.  For example:

    var Person = {
      name: "Tim",
      age: 27,
      greeting: function () {
        return "Hello " + this.name + ".  Wow, you're " + this.age + " years old.";
      }
    };
    
    puts(Person.greeting());

Note that I was able to access `Person.name` and `Person.age` from within `Person.greeting`.  

### "`this`" is where it bites

The previous code almost looks like objects from other languages.  But that's where it bites you.  As the author of the `Person` module, you have no assurance that "`this`" will be the same as "`Person`".  For example, what if I wanted to store the greeting function somewhere else:

    var greeting = Person.greeting;
    puts(greeting()); // Will get undefined for `this.name` and `this.age`

The problem here is that "`this`" in the body of the greeting function is now the global object and not the `Person` object.  How about one more example just for fun:

    var Dog = {
      name: "Alfred",
      age: 110
      greeting: Person.greeting
    }
    
    puts(Dog.greeting());  // This will work and it will show the dog's data.

The greeting function in Dog and the function in Person are **the same** function.  They're both references to the same object in memory.  But depending on where it's called from, can change the value of "`this`".  Basically "`this`" is whatever object comes before the dot in the call.  That's why `Dog.greeting()` uses `Dog` as "`this`" and `Person.greeting()` uses `Person`.  When there is nothing before the function call, then the global object is used for "`this`".

### Taming "`this`"

JavaScript comes with a couple of handy-dandy functions on `Function.prototype` called `call` and `apply`.  They work about the same, but take arguments differently.  Going on from the previous examples, let's make a new object that doesn't even have a `greeting` function, but can still be used by it.

    var Alien = {
      name: "Zygoff",
      age: 5432
    }
    
    puts(Person.greeting.call(Alien));

What we're saying here is to call the Person.greeting function, but inject the object `Alien` as the "`this`" value.  We could have used `apply` just the same for this example since there are no extra arguments.

Let's make a generic function that can work with any object that has `age` and `name` properties:

    function makeOlder(years, newname) {
      this.age += years;
      if (newname) {
        this.name = newname;
      }
    }

This function just adds years to any "`this`" object and optionally replaces the name.  It's not tied to any particular object. (In fact any function not using variables from outer scopes is independent) Here is how we would use it with either `call` or `apply`.
    
    makeOlder.call(Person, 2, "Old Tim");
    makeOlder.apply(Dog, [1, "Shaggy"]);

The difference is that each extra argument to `call` is an argument passed to the function.  But with apply, there are only two arguments.  They are the "`this`" object and an array of the parameters to pass to the function.

### Binding "`this`"

Sometimes we really like our nice OOP style code and want to force JS to act that way.  We don't like "`this`" changing on us depending on how we're calling it all the time.  The most common place where it bites me is in an event based system that takes callbacks as arguments.  Here is a simple example from jQuery.

    Cart = {
      items: [1,4,2],
      onClick: function () {
        // Do something with this.items.
      }
    }
    $("#mybutton").click(Cart.onClick);

While this looks ok, it's waiting for disaster.  Even though we have `Cart.onClick`, we're not calling the `onClick` function yet.  the jQuery code will accept is as some parameter and at that point it has no way of knowing that `onClick` came from the `Cart` object.  Your "`this`" won't be what you expect when it finally gets called.

Let's combine our knowledge of closures and lexical scope and make "`this`" scope act like it does in most OOP languages.

    $("#mybutton").click(function () { Cart.onClick() });

We created a little closure that then calls `Cart.onClick()`.  The problem with this (besides being long and ugly) is that is doesn't pass through any function parameters or return values.  We can fix that some.

    $("#mybutton").click(function () { return Cart.onClick.apply(Cart, arguments) });

This works, but it's even harder to read and understand.  If you don't already know, "`arguments`" is another special function that is an array-like object that contains the arguments that were passed to the current inner-most function.

If Cart was a globally accessible singleton object we could just use the variable `Cart` directly instead of relying on "`this`", but that's often not the case when you have "classes" of objects sharing common functionality.

Wouldn't it be easier to somehow modify `Cart.onClick` so that "`this`" was always Cart from within it? (NOTE: )

    function bind(fn, scope) {
      return function () {
        return fn.apply(scope, arguments);
      }
    }
    Cart.onClick = bind(Cart.onClick, Cart);
    $("#mybutton").click(Cart.onClick);

There are various ways of doing this and in fact it's often not the right solution.  If you're just trying to make JavaScript act like language X then this is a great little tool, but it's better to just learn the semantics of JavaScript.

Here we've just created a closure that has the scope embedded.  Then we replace Cart.onClick with the bound closure and use the apply magic to pass through any arguments and return value automatically.

## Var statements

The var statement is really just a keyword to specify which nested scope a variable applies to.  In fact, if you never used `var`, then all your variables would be global and walk all over each other.

    global_var = true;
    function () {
      another_global = 42;
      var local_var = 5;
    }

This is especially dangerous in things like for loops:

    function sum(start, end) {
      var n = 0;
      for (i = start; i < end; i++) {
        n += i;
      }
      return n;
    }
  
    function nested_sum(array) {
      var n = 0;
      for (i in array) {
        n += sum(0, array[i]);
      }
      return n;
    }
  
    nested_sum([1,2,3]);

The `i` variable in both loops is the **same** variable and so the inner loop will break the outer loop and give the wrong answer.  Also if I had not put var statements before the two `n` variables, then they would walk over each other and give a wrong answer too.

There is one word of caution for `var` users.  It doesn't matter where in the function body you put the `var` word.  It only matters which function body you put it in.  And it's scope in inner to function parameters. For example:

    function greet(name) {
      // name is undefined
      // Lots of code, and them later on you have:
      var name;
    }
    greet("Tim");

This is why [jslint][] tells you to put all your var statements at the top of a function.  I've actually had this one bite me because there was a page of code between the top of the function and the `var` statement.  I couldn't figure out why my variable I was passing in got set to `undefined` before the first line of the function body.    

## Conclusion

There some universal rules that will go a long way to understanding scope in JavaScript:

 - The only way to create a new scope is through the `function` keyword.  Nothing else, not even `for ... in` blocks create new scopes.
 - The `var` statement declares a variable as local to the current scope and the **entire** current scope, not just from the `var` statement onward.  These local variables shadow any existing variables from outer scopes.
 - All variables except "`this`" and "`arguments`" follow lexical scope.  Their meaning is defined by the **physical location** in the code.
 - The variables "`this`" and "`arguments`" change at **every** nesting level.  If you want to preserve them in a closure, then you need to first create a reference to their value through another variable that follows lexical scope.
 - The value of "`this`" is defined by **how** the function is called.  You can control this through use of `apply` and `call`.

There are exceptions to these rules, but only when messing with things like function decompilation, `eval`, and the `with` keyword.  Even then you're still following the rules, just not in the way you'd expect. Function decompilation + `eval` transplants a function into a new lexical scope. And `with` can be used to make things like `this.name` appear as local lexical variables but work like "`this`" properties.
 
[jslint]: http://www.jslint.com/