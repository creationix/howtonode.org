// import meryl
var meryl = require('meryl');
// import built-in static file plugin
var staticfile = meryl.findp('staticfile');

// register our plugin mapping the 'static' virtual
// path for static content

// options we're passing to staticfile function are default already but
// demonstrated here for clarification.

// root param denotes the root path for static content on file system
// path param denotes the url expression paramter which to lookup file under root
meryl.p('GET /static/<filepath>', staticfile({root: 'public', path: 'filepath'}));


// of course plug meryl
require('http').createServer(meryl.cgi()).listen(3000);
