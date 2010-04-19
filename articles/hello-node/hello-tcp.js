// Load the sys module for console writing.
var sys = require('sys');
// Load the net module to create a tcp server.
var net = require('net');

// Setup a tcp server
var server = net.createServer(function (socket) {
  
  // Every time someone connects, tell them hello and then close the connection.
  socket.addListener("connect", function () {
    sys.puts("Connection from " + socket.remoteAddress);
    socket.write("Hello World\n");
    socket.end();
  });
  
});

// Fire up the server bound to port 7000 on localhost
server.listen(7000, "localhost");

// Put a friendly message on the terminal
sys.puts("TCP server listening on port 7000 at localhost.");
