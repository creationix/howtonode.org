var Tank = function(initial_x, initial_y, shells_remaining) {
  this.x_location = initial_x || 0;
  this.y_location = initial_y || 0;
  this.shells = shells_remaining || 10;
}

Tank.prototype.shoot = function() {
  if(this.shells >= 0) {
    console.log('Ka-Boom!');
    this.shells -= 1;
    return true;
  }
  else {
    console.log('Out of ammo!');
    return false;
  }
}

Tank.prototype.move = function(x, y) {
  // Do a distance calculation, maybe some setTimeout then...
  this.x_location = x;
  this.y_location = y;
}

exports.Tank = Tank;
