// Just a basic server setup for this site
var Http = require('http'),
    Stack = require('stack'),
    Creationix = require('creationix'),
    Wheat = require('wheat');

module.exports = Http.createServer(Stack(
  Creationix.log(),
  Wheat(__dirname)
));
