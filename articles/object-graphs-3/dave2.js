// Make a parent class
function Person() {}
// with an instance method
Person.prototype.greet = function greet() {
  console.log("Hello");
}
// and a class method.
Person.create = function create() {
  return new this();
};

// Create a subclass
function Dave() {}
Dave.__proto__ = Person;
Dave.prototype.__proto__ = Person.prototype;
// and test it.
console.log(Dave.create());
console.log(new Dave);
Dave.create().greet();