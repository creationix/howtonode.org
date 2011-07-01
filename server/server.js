// Just a basic server setup for this site
var Stack = require('stack'),
    Creationix = require('creationix'),
    Http = require('http');

Http.createServer(Stack(
  Creationix.log(),
  require('wheat')(process.env.JOYENT ? process.env.HOME + "/howtonode" : __dirname +"/..")
)).listen(process.env.JOYENT ? 80 : 8080);
