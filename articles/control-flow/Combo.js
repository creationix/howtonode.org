function Combo(callback) {
  this.callback = callback;
  this.items = 0;
  this.results = [];
}

Combo.prototype = {
  add: function () {
    var self = this,
        id = this.items;
    this.items++;
    return function () {
      self.check(id, arguments);
    };
  },
  check: function (id, arguments) {
    this.results[id] = Array.prototype.slice.call(arguments);
    this.items--;
    if (this.items == 0) {
      this.callback.apply(this, this.results);
    }
  }
};
