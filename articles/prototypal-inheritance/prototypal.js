var sys = require('sys');

//intro-to-style
var Person = {
  greet: function () {
    return "Hello world, my name is " + this.name;
  }
};
var frank = Object.create(Person);
frank.name = "Frank Dijon";
frank.greet();

//object-create
Object.create(Person, {name: {value: "Frank Dijon", enumerable: true}})

//object-create-ii
Object.create(Person, {name: {value: "Frank Dijon"}});

//object-create-iii
var frank = Object.create(Person, {name: {value: "Frank Dijon"}})
sys.puts(sys.inspect(frank));
sys.puts(sys.inspect(frank, true));
