var Connect = require('connect');

module.exports = Connect.createServer(
  require('./log-it')(),
  require('./serve-js')()
);