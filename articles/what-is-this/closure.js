// Make a function that returns a closure function.
function myModule() {
  var name = "tim", age = 28;
  return function greet() {
    return "Hello " + name + ".  Wow, you are " + age + " years old.";
  }
}
// call `myModule` to get a closure out of it.
var greeter = myModule();
// Call the closure
greeter();
