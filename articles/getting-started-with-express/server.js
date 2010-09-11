//requires
var express = require('express'),
    app = express.createServer();

//routes
app.get('/', function(req, res){
    res.send('Hello World');
});

//start
app.listen();
console.log('Express server started on port %s', app.address().port);

