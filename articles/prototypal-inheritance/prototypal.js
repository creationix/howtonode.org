
//intro-to-style
var Person = {
  greet: function () {
    return "Hello world, my name is " + this.name;
  }
};
var frank = Object.create(Person);
frank.name = "Frank Dijon";
frank.greet(*);

//object-create
var frank = Object.create(Person, {name: {value: "Frank Dijon", enumerable: true}})

//object-create-ii
var frank = Object.create(Person, {name: {value: "Frank Dijon"}})

