// login-unit.js var login = require('login.js'),
    Future = require('future'),

exports.testLogin = function(test){
    var future = login.loginUser('email', 'pass');
    future.when (function (error, user) {
        test.notEqual(user, null, "The user was null!");
        test.done()
    });
};

