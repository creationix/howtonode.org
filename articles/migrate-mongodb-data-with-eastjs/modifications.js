
//db user model
exports.User = mongoose.model('User', {
	name: {type: String, required: true, unique: true},
	contacts: {
		email: {type: String, required: true},
		phone: String
	}
});

//app create user
app.post('/users', function(req, res, next) {
	var user = new db.User({
		name: req.param('name'),
		contacts: {
			email: req.param('email'),
			phone: req.param('phone') || ''
		}
	});
	user.save(function(err) {
		if (err) return next(err);
		res.json(user);
	});
});
