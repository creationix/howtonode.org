var Connect = require('connect');

module.exports = Connect.createServer([
  {filter: "log"}, // Log responses to the terminal using Common Log Format.
  {filter: "response-time"}, // Add a special header with timing information.
  {filter: "conditional-get"}, // Add HTTP 304 responses to save even more bandwidth.
  {filter: "cache"}, // Add a short-term ram-cache to improve performance.
  {filter: "gzip"}, // Gzip the output stream when the browser wants it.
  {provider: "static", root: "."} // Serve all static files in the current dir.
]);