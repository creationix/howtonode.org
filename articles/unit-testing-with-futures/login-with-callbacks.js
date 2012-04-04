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

function loginUserPrivate(email, pass, callback) {
    db.users.find({'email':email,'password':password}).forEach(function(err, user) {
        callback(user);
    });
}

app.post('/login', function(req, res){
    var email = req.body.email, password = req.body.password;

    loginUserPrivate(email, password, function(data) {
        res.send('Found user ' + user);
    });
}); 

module.exports = {
    loginUser: function(email, pass, callback) {
        return loginUserPrivate(email, pass, callback);
    }
}

