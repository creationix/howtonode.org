var Lane = {
  name: "Lane the Lambda",
  description: function () {
    return this.name;
  }
};
var description = Lane.description;
var Fred = {
  description: Lane.description,
  name: "Fred the Functor"
};
// Call the function from four different scopes
console.log(Lane.description());
console.log(Fred.description());
console.log(description());
console.log(description.call({
  name: "Zed the Zetabyte"
}));
