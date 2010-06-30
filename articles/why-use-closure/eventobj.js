var Person = require('./personclass'),
    newPerson = require('./personfactory');

var bob = new Person("Bob", 47);
var jake = new Person("Jake", 17);
var tim = newPerson("Tim", 28);

setTimeout(bob.greet, 100);
// Outputs: undefined

setTimeout(tim.greet, 100);
// Outputs: Tim, who is 28 years old, says hi!

// With `this` based objects you have to manually bind the function
// This works
setTimeout(function () {
  jake.greet();
}, 100);
// Outputs: Jake, who is 17 years old, says hi!
