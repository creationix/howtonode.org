function makeClosure(name) {
  return function () {
    return name;
  };
}
var description1 = makeClosure("Cloe the Closure");
var description2 = makeClosure("Albert the Awesome");
console.log(description1());
console.log(description2());