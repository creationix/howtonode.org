var CB  = require('cloudboost');

var express = require('express');
var app = express();
var http = require('http').Server(app);

//init the app
CB.CloudApp.init('Your App ID', 'Your App Key');

app.post('/course/:name', function(req,res) {
    var course = new CB.CloudObject('Course');
    course.set('name',req.params.name);
    course.save({
    	success : function(obj){
        	 res.status(200).send({message : "Course Registered" });
        }, error: function(error){
        	res.status(500).send(error);
        }
    });
});

app.get('/course/:name', function(req,res) {
    var query = new CB.CloudQuery('Course');
    query.equalTo('name',req.params.name);
    query.findOne({
    	success : function(obj){
        	 res.status(200).send({course : CB.toJSON(obj) });
        }, error: function(error){
        	res.status(500).send(error);
        }
    });
});

app.delete('/course/:name', function(req,res) {
    var query = new CB.CloudQuery('Course');
    query.equalTo('name',req.params.name);
    query.findOne({
    	success : function(obj){
        if(obj){
        	obj.delete({
              success : function(obj){
                  res.status(200).send({message : "Success" });
              }, error: function(error){
                  res.status(500).send(error);
              }
          	});
          }else{
          	res.status(200).send({message : "Not found." });
          }
        }, error: function(error){
        	res.status(500).send(error);
        }
    });
});

//start the server on port 8000
http.listen(8000, function() {
   console.log("Server Started.");
});