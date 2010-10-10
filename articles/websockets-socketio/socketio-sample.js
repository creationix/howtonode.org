var socket = new io.Socket();
socket.on('connect', function(){
	// connected!
});
socket.on('message', function(msg){
	// message coming
});
socket.send('Hello world!');
