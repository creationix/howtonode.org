//person
var Person = {
  name: "Tim",
  age: 28,
  greeting: function () {
    return "Hello " + this.name + ".  Wow, you are " + this.age + " years old.";
  }
};

Person.greeting();

//standalone
var greeting = Person.greeting;
greeting(); // Will get undefined for `this.name` and `this.age`

//dog
var Dog = {
  name: "Alfred",
  age: 110,
  greeting: Person.greeting
}

Dog.greeting(); // This will work and it will show the dog's data.

//alien
var Alien = {
  name: "Zygoff",
  age: 5432
}

Person.greeting.call(Alien);

//make-older
function makeOlder(years, newname) {
  this.age += years;
  if (newname) {
    this.name = newname;
  }
}

//use-it
makeOlder.call(Person, 2, "Old Tim");
makeOlder.apply(Dog, [1, "Shaggy"]);
console.dir({Person: Person, Dog: Dog});
