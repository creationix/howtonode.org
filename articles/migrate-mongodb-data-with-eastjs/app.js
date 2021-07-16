
var express = require('express'),
	db = require('./db');

var app = express();

db.connect();
app.use(express.urlencoded());
app.use(express.json());

//list users
app.get('/users', function(req, res, next) {
	db.User.find({}, function(err, users) {
		if (err) return next(err);
		res.json(users);
	});
});

//create user
app.post('/users', function(req, res, next) {
	var user = new db.User({
		name: req.param('name'),
		email: req.param('email')
	});
	user.save(function(err) {
		if (err) return next(err);
		res.json(user);
	});
});

//start server
app.listen(3000);
