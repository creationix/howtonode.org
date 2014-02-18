// This is a module that can be mixed into any prototype
module.exports = {
  name: "Enumerable",
  // Implements a forEach much like the one for Array.prototype.forEach.
  forEach: function forEach(callback, thisObject) {
    var keys = Object.keys(this),
        length = keys.length;
    for (var i = 0; i < length; i++) {
      var key = keys[i];
      callback.call(thisObject, this[key], key, this);
    }
  },
  // Implements a map much like the one for Array.prototype.map.
  // Returns a normal Array instance.
  map: function map(callback, thisObject) {
    var keys = Object.keys(this),
        length = keys.length,
        accum = new Array(length);
    for (var i = 0; i < length; i++) {
      var key = keys[i];
      accum[i] = callback.call(thisObject, this[key], key, this);
    }
    return accum;
  },
  get length() {
    return Object.keys(this).length;
  }
};
