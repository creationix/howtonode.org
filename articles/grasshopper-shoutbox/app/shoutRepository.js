var couchdb = require('couchdb'),
    Shout = require('./model').Shout;

exports.all = function(cb) {
    var db = couchdb.createClient().db('shout');
    db.view('shout', 'all', {}, function(err, res) {
        if(!err) {
            var shouts = []
            res.rows.forEach(function(row) {
                var shout = new Shout();
                shout.name(row.value.name)
                     .email(row.value.email)
                     .message(row.value.message);
                shouts.push(shout);
            });
        }
        cb(err, shouts);
    });
};

exports.save = function(shout, cb) {
    var doc = {
        name: shout.name(),
        email: shout.email(),
        message: shout.message()
    };
    var db = couchdb.createClient().db('shout');
    db.saveDoc(doc, function(err) {
        cb(err);
    });
};
