
/**
 * Module dependencies.
 */

var express = require('express')
  , http = require('http');

var app = express();

 // Mongo setup
var databaseUrl = "company"; 
var collections = ["employees"]
var db = require("mongojs").connect(databaseUrl, collections);

app.configure(function(){
  app.set('port', process.env.PORT || 3000);
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
});

// Import the data
require('./import')(db);

app.get('/query/:term', function(req, res){

  var term = req.params.term;
  
  db.employees.find({}, function(err, results) {
    if( err || !results) {
      res.json([]);
    } else {
      res.json(results);
    }
  });  
  

});

http.createServer(app).listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});