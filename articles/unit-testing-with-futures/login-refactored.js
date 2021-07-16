// login.js
var
    express = require('express'),
    app = express.createServer(),

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
    db.users.find({'email':email,'password':password}).forEach(function(err, user) {
        return user;
    });
}

app.post('/login', function(req, res){
    var email = req.body.email, password = req.body.password;

    var user = loginUserPrivate(email, password);
    res.send('Found user ' + user);
}); 

module.exports = {
    loginUser: function(email, pass) {
        return loginUserPrivate(email, pass);
    }
}
