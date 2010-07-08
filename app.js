// Just a basic server setup for this site
var Connect = require('connect');

module.exports = Connect.createServer(
  Connect.responseTime(),
  Connect.logger(),
  Connect.conditionalGet(),
  Connect.cache(),
  Connect.gzip(),
  require('wheat')(__dirname)
);
