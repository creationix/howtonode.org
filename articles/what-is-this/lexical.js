var sys = require('sys');

var name = "outer";
function one() {
  var name = "middle";
  var other = "findme";
  function two() {
    var name = "inner";
    // Here `name` is "inner" and `other` is "findme"
    sys.p({name: name, other: other});
  }
  two();
  // Here `name` is "middle" and `other` is "findme"
  sys.p({name: name, other: other});
}
one();
// Here `name` is "outer" and `other` is undefined.
sys.p({name: name});
sys.p({other: other});
