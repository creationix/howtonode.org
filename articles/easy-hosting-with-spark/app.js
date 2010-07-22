var Connect = require('connect');

// Define a simple connect app stack
module.exports = Connect.createServer(
    Connect.logger(),
    Connect.conditionalGet(),
    Connect.cache(),
    Connect.gzip(),
    Connect.bodyDecoder(),
    Connect.router(require('./memory_bank')),
    Connect.staticProvider(__dirname + "/public"),
    Connect.errorHandler({showStack: true})
);