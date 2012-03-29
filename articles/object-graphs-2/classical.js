//rectangle
function Rectangle(width, height) {
  this.width = width;
  this.height = height;
}
Rectangle.prototype.getArea = function getArea() {
  return this.width * this.height;
};
Rectangle.prototype.getPerimeter = function getPerimeter() {
  return 2 * (this.width + this.height);
};
Rectangle.prototype.toString = function toString() {
  return this.constructor.name + " a=" + this.getArea() + " p=" + this.getPerimeter();
};
//square
function Square(side) {
  this.width = side;
  this.height = side;
}
// Make Square inherit from Rectangle
Square.prototype = Object.create(Rectangle.prototype, { constructor: { value: Square } });
// Override a method
Square.prototype.getPerimeter = function getPerimeter() {
  return this.width * 4;
};
//test
var rect = new Rectangle(6, 4);
var sqr = new Square(5);
console.log(rect.toString())
console.log(sqr.toString())
