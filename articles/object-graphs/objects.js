// Create a parent object
var tim = {
  name: "Tim Caswell",
  age: 28,
  isProgrammer: true,
  likesJavaScript: true
}
// Create a child object
var jack = Object.create(tim);
// Override some properties locally
jack.name = "Jack Caswell";
jack.age = 4;
// Look up stuff through the prototype chain
jack.likesJavaScript;

