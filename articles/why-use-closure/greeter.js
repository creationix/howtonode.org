function greeter(name, age) {
  var message = name + ", who is " + age + " years old, says hi!";
  
  return function greet() {
    console.log(message);
  };
}

// Generate the closure
var bobGreeter = greeter("Bob", 47);

// Use the closure
bobGreeter();
