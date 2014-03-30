
var mongoose = require('mongoose');

exports.connect = function() {
	mongoose.connect('mongodb://localhost/east-sample-db');
};

exports.disconnect = function() {
	mongoose.connection.close()
};

//user model
exports.User = mongoose.model('User', {
	name: {type: String, required: true, unique: true},
	contacts: {
		email: {type: String, required: true},
		phone: String
	}
});
