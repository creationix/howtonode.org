//rectangle
var Rectangle = {
  name: "Rectangle",
  getArea: function getArea() {
    return this.width * this.height;
  },
  getPerimeter: function getPerimeter() {
    return 2 * (this.width + this.height);
  },
  toString: function toString() {
    return this.name + " a=" + this.getArea() + " p=" + this.getPerimeter();
  }
};
//square
var Square = {
  name: "Square",
  getArea: function getArea() {
    return this.width * this.width;
  },
  getPerimeter: function getPerimeter() {
    return this.width * 4;
  },
};
Square.__proto__ = Rectangle;
//test
var rect = Object.create(Rectangle);
rect.width = 6;
rect.height = 4;
var square = Object.create(Square);
square.width = 5;
console.log(rect.toString());
console.log(square.toString());
