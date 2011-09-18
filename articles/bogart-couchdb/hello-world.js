var bogart = require('bogart');

var app = bogart.router(function(get, post, update, destroy) {
    get('/', function() {
        return bogart.html('Hello World');
    });
});

bogart.start(app);
