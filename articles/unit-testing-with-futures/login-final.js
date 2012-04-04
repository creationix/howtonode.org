// login.js
var
    express = require('express'),
    app = express.createServer(),

    // Future object
    Future = require('future'),

    // Database Config
    mongo = require('mongojs'),
    mongoStore = require('connect-mongodb'),
    db = mongo.connect('dbname',['users']);

// Configuration
app.configure(function(){
    ...
});

app.listen(3000);

function loginUserPrivate(email, pass) {
    var future = new Future();     
    db.users.find({'email':email,'password':password}).forEach(function(err, user) {
        future.deliver(err, user);
    });
    return future;
}

app.post('/login', function(req, res){
    var email = req.body.email, password = req.body.password;

    var future = loginUserPrivate(email, password);

    future.when (function (error, user) {
        res.send('Found user ' + user);
    });
}); 

module.exports = {
    loginUser: function(email, pass) {
        return loginUserPrivate(email, pass);
    }
}

