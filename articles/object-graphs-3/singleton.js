var animal = /cat/;

animal.speak = function speak() {
  console.log("The " + this + " says miaow");
};
animal.speak();
animal.test('caterpiller');