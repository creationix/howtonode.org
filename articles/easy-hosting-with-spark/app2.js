var Connect = require('connect');

// Define a simple connect app stack using the new createApp helper
module.exports = Connect.createApp(require('./memory_bank'));
