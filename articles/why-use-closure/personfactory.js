var sys = require('sys');

// Define the factory
function newPerson(name, age) {

  // Store the message in a closure
  var message = name + ", who is " + age + " years old, says hi!";

  return {

    // Define a sync function
    greet: function greet() {
      sys.puts(message);
    },

    // Define a function with async internals
    slowGreet: function slowGreet() {
      setTimeout(function () {
        sys.puts(message);
      }, 1000);
    }

  };
}

// Export this file as a module
module.exports = newPerson;