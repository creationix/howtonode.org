function greet(message) {
  console.log(message);
}

function greeter(name, age) {
  return name + ", who is " + age + " years old, says hi!";
}

// Generate the message
var message = greeter("Bob", 47);

// Pass it explicitly to greet
greet(message);
