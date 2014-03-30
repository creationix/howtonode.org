
/*
 * Include our project database file
 */
var db = require('../db');

var usersData = [{
	name: 'user',
	contacts: {email: 'user@example.com'}
}, {
	name: 'admin',
	contacts: {email: 'admin@example.com'}
}];

exports.migrate = function(client, done) {
	db.connect();
	var saved = 0;
	usersData.forEach(function(userData) {
		var user = new db.User(userData);
		user.save(function(err) {
			if (err) return done(err);
			saved++;
			if (saved === usersData.length) {
				db.disconnect();
				done();
			}
		});
	});
};

exports.rollback = function(client, done) {
	db.connect();
	db.User.remove({name: {'$in': usersData.map(function(userData) {
		return userData.name;
	})}}, function() {
		db.disconnect();
		done();
	});
};
