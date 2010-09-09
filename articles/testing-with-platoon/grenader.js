var Grenader = function (timer) {
  this.timer = timer || 5;
}

Grenader.prototype.throw = function(callback) {
  console.log("Fire in the hole!");
  setTimeout(function() {
    callback('Ka-Boom!');
  }, this.timer * 1000);
}

exports.Grenader = Grenader;
