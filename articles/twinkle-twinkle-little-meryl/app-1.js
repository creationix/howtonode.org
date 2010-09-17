// app.js 

// import meryl
var meryl = require('meryl');

// Now define a request handler tied to an url expression.
meryl.h('GET /', function () { this.send('<h3>Hello, World!</h3>'); });

// OK, here we go. Let's plug meryl into your http server instance.
require('http').createServer(meryl.cgi()).listen(3000);