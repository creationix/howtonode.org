var sys = require('sys');

function greeter(name, age) {
  var message = name + ", who is " + age + " years old, says hi!";
  
  return function greet() {
    sys.puts(message);
  };
}

// Generate the closure
var bobGreeter = greeter("Bob", 47);

// Use the closure
bobGreeter();
