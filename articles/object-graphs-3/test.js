var Class = require('./class'),
    Enumerable = require('./enumerable');

var Foo = Class.extend("Foo", {
  greet: function greet() {
    console.log("Hello World");
  }
});
Foo.mixin(Enumerable);

var f = Foo.new();
f.greet();
f.age = 28;
f.height = 12 * 6 + 4;
console.dir(f.map(function (key, value) { return key + " = " + value; }));
console.dir(f.ancestors);
console.dir(f.length);
