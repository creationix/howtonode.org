// Create a couple of local variables in a function.
function newScope() {
  var name = "tim";
  var age = 28;
}
// Try to access the local variables from the global scope
// This will cause an error.
name;
