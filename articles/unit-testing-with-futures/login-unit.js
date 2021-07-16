// login-unit.js
var login = require('login.js');
exports.testLogin = function(test){
    test.notEqual(login.loginUser('email', 'pass'), null, "The user was null!");
    test.done();
};
