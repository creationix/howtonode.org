var platoon = require('platoon');
var Grenader = require('../grenader').Grenader;

exports.TestGrenader = platoon.unit({},
  function(assert) {
    "Throw the grenade and make sure it goes ka-boom.";
    var grenader_1 = new Grenader();
    grenader_1.throw(assert.async(function(result) {
      assert.equal(result, 'Ka-Boom!');
    }));
  }
);
