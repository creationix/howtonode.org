function Person(name) {
  this.name = name
}
Person.prototype = {
  greet: function () {
    return "Hello world, my name is " + this.name;
  }
};

var frank = new Person("Frank Dijon");
var message = frank.greet();
// message is now "Hello world, my name is Frank Dijon"
