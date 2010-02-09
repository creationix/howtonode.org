process.mixin(require('sys'))

var Person = {
  greet: function () {
    return "Hello world, my name is " + this.name;
  }
};
var frank = Object.create(Person);
frank.name = "Frank Dijon";
puts(frank.greet());
// message is now "Hello world, my name is Frank DiJon"

frank = Object.create(Person, {name: {value: "Frank Dijon"}})
puts(inspect(frank));
// {}
puts(inspect(frank, true));
// {
//  [name]: "Frank Dijon"
// }


