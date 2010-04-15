// Make a function that returns a closure function.
function myModule() {
  var name = "tim", age = 27;
  return function greet() {
    sys.puts("Hello " + name + ".  Wow, you're " + age + " years old.");
  }
}
// call `myModule` to get a closure out of it.
var greeter = myModule();
// Call the closure
greeter();
