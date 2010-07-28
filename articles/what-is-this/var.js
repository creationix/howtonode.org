//globals
global_var = true;
function someFunc() {
  another_global = 42;
  var local_var = 5;
}

//loops
function sum(start, end) {
  var n = 0;
  for (i = start; i <= end; i++) {
    n += i;
  }
  return n;
}

function nested_sum(num) {
  var n = 0;
  for (i = 1; i <= num; i++) {
    n += sum(1, i);
  }
  return n;
}

nested_sum(3); // Expected value is 10, but i values get tangled

//onevar
name = "Tim";
function greet() {
  console.dir(name);
  // name is undefined
  // Lots of code, and them later on you have:
  var name;
}
greet();

function greet2(name) {
  console.dir(name);
  // name is "Tim" because functions arguments are special.
  // Lots of code, and them later on you have:
  var name;
}
greet2("Tim");
