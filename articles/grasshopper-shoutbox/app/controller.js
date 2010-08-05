var gh = require('grasshopper'),
    shoutRepo = require('./shoutRepository'),
    Shout = require('./model').Shout;

gh.get('/', function() {
    var self = this;
    shoutRepo.all(function(err, shouts) {
        self.model['shout'] = new Shout();
        self.model['shouts'] = shouts;
        self.render('index');
    });
});

gh.post('/', function() {
    var self = this;
    var shout = new Shout().update(this.params['shout']);
    if(shout.isValid()) {
        shoutRepo.save(shout, function() {
            self.flash['success'] = 'Thanks for shouting!';
            self.redirect('/');
        });
    } else {
        shoutRepo.all(function(err, shouts) {
            self.model['shouts'] = shouts;
            self.model['shout'] = shout;
            self.render('index');
        });
    }
});
