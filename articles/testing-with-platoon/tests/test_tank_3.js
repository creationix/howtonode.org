var platoon = require('platoon');
var Tank = require('../tank').Tank;

exports.TestTank = platoon.unit({},
  function(assert) {
    "Make sure we can have a tank of our very own.";
    var tank_1 = new Tank();
    assert.equal(tank_1.x_location, 0);
    assert.equal(tank_1.y_location, 0);
    assert.equal(tank_1.shells, 10);
    
    var tank_2 = new Tank(10, 20, 8);
    assert.equal(tank_2.x_location, 10);
    assert.equal(tank_2.y_location, 20);
    assert.equal(tank_2.shells, 8);
  },
  function(assert) {
    "Check that movement is working properly.";
    var tank_1 = new Tank();
    assert.equal(tank_1.x_location, 0);
    assert.equal(tank_1.y_location, 0);
    
    tank_1.move(5, 6);
    assert.equal(tank_1.x_location, 5);
    assert.equal(tank_1.y_location, 6);
  },
  function(assert) {
    "Shoot the cannon!";
    var tank_1 = new Tank(0, 0, 2);
    assert.equal(tank_1.shells, 2);
    
    assert.equal(tank_1.shoot(), true);
    assert.equal(tank_1.shells, 1);
    
    assert.equal(tank_1.shoot(), true);
    assert.equal(tank_1.shells, 0);
    
    tank_1.shoot();
    assert.equal(tank_1.shells, 0);
  }
);
