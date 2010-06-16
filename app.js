// Just a basic server setup for this site
module.exports = require('connect').createServer([
  {filter: "response-time"},
  {filter: "log"},
  {filter: "conditional-get"},
  {filter: "cache"},
  {filter: "gzip"},
  {module: require('wheat'), repo: __dirname}
]);
