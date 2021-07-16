
exports.migrate = function(client, done) {
	var db = client.db;
	db.collection('users').update({}, {
		$rename: {email: 'contacts.email'}
	}, {multi: true}, done);
};

exports.rollback = function(client, done) {
	var db = client.db;
	db.collection('users').update({}, {
		$rename: {'contacts.email': 'email'}
	}, {multi: true}, done);
};
