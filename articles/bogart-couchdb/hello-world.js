var bogart = require('bogart');

var router = bogart.router();

router.get('/', function() {
  return bogart.html('Hello World');
});

bogart.start(app);
