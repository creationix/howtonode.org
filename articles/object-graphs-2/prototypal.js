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
var Square = Object.create(Rectangle);
Square.name = "Square";
Square.getArea = function getArea() {
  return this.width * this.width;
};
Square.getPerimeter = function getPerimeter() {
  return this.width * 4;
};
//test
var rect = Object.create(Rectangle);
rect.width = 6;
rect.height = 4;
var square = Object.create(Square);
square.width = 5;
console.log(rect.toString());
console.log(square.toString());
