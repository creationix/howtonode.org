// Just a basic server setup for this site
var Connect = require('connect');

module.exports = Connect.createServer(
  Connect.logger(),
  Connect.conditionalGet(),
  Connect.favicon(),
  Connect.cache(),
  Connect.gzip(),
  require('wheat')(__dirname)
);
