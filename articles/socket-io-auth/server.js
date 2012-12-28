// Imports
var io      =   require('socket.io')
,   http    =   require('http')
,   express =   require('express')
,   cookie  =   require('cookie')
,   connect =   require('connect');


// Create Express
var app = express();

// Configure Express app with:
// * Cookie parser
// * Session manager
app.configure(function () {
    app.use(express.cookieParser());
    app.use(express.session({secret: 'secret', key: 'express.sid'}));
  });

// Configture GET '/' to return index.html
app.get('/', function (req, res) {
  res.sendfile(__dirname + '/index.html');
});

// Create HTTP server on port 3000 and register socket.io as listener
server = http.createServer(app)
server.listen(3000);
io = io.listen(server);

// Configure global authorization handling. handshakeData will contain
// the request data associated with the handshake request sent by
// the socket.io client. 'accept' is a callback function used to either
// accept or reject the connection attempt.
// We will use the session id (attached to a cookie) to authorize the user.
// in this case, if the handshake contains a valid session id, the user will be authorized.
io.set('authorization', function (handshakeData, accept) {
    // check if there's a cookie header
    if (handshakeData.headers.cookie) {
        // if there is, parse the cookie
        handshakeData.cookie = cookie.parse(handshakeData.headers.cookie);
        // the cookie value should be signed using the secret configured above (see line 17).
        // use the secret to to decrypt the actual session id.
	    handshakeData.sessionID = connect.utils.parseSignedCookie(handshakeData.cookie['express.sid'], 'secret');
	    // if the session id matches the original value of the cookie, this means that
	    // we failed to decrypt the value, and therefore it is a fake. 
        if (handshakeData.cookie['express.sid'] == handshakeData.sessionID) {
        	// reject the handshake
        	return accept('Cookie is invalid.', false);
        }
    } else {
       // if there isn't, turn down the connection with a message
       // and leave the function.
       return accept('No cookie transmitted.', false);
    } 
    // accept the incoming connection
    accept(null, true);
}); 

// upon connection, start a periodic task that emits (every 1s) the current timestamp
io.on('connection', function (socket) {
  var sender = setInterval(function () {
    socket.emit('data', new Date().getTime());
  }, 1000)

  socket.on('disconnect', function() {
    clearInterval(sender);
  })
  
});