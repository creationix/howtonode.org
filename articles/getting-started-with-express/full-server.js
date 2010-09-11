var express = require('express'),
    app = express.createServer();

app.use(express.logger());

app.get('/', function(req, res){
    res.send('Hello World');
});

app.listen();
console.log('Express server started on port %s', app.address().port);
