var Connect = require('connect');

module.exports = Connect.createServer([
  {module: require('./log-it')},
  {module: require('./serve-js')}
]);