// Just a basic server setup for this site
var Stack = require('stack'),
    Creationix = require('creationix'),
    Http = require('http');

Http.createServer(Stack(
  Creationix.log(),
//  require('wheat')(process.env.HOME + "/howtonode")
  require('wheat')(__dirname +"/..")
)).listen(8080);
