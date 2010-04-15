var sys = require('sys');

//object-spawn
Object.spawn = function (parent, props) {
  var defs = {}, key;
  for (key in props) {
    if (props.hasOwnProperty(key)) {
      defs[key] = {value: props[key], enumerable: true};
    }
  }
  return Object.create(parent, defs);
}

//animals
var Animal = {
  eyes: 2,
  legs: 4,
  name: "Animal",
  toString: function () {
    return this.name + " with " +
      this.eyes + " eyes and " +
      this.legs + " legs.";
  }
}
var Dog = Object.spawn(Animal, {
  name: "Dog"
});
var Insect = Object.spawn(Animal, {
  name: "Insect",
  legs: 6
});
var fred = Object.spawn(Dog);
var pete = Object.spawn(Insect);
sys.puts(fred);
sys.puts(pete);


//proto-spawn
Object.prototype.spawn = function (props) {
  var defs = {}, key;
  for (key in props) {
    if (props.hasOwnProperty(key)) {
      defs[key] = {value: props[key], enumerable: true};
    }
  }
  return Object.create(this, defs);
}

//animals2
var Animal = {
  eyes: 2,
  legs: 4,
  name: "Animal",
  toString: function () {
    return this.name + " with " + this.eyes + " eyes and " + this.legs + " legs."
  }
}
var Dog = Animal.spawn({
  name: "Dog"
});
var Insect = Animal.spawn({
  name: "Insect",
  legs: 6
});
var fred = Dog.spawn({});
var pete = Insect.spawn({});
sys.puts(fred);
sys.puts(pete);
