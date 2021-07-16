Title: A simple log server using express, nodejs, and mongodb
Author: Afshin Mehrabani
Date: Monday, 2 April 2012, 04:08:43 EST

### Introduction 

In this article we are going to review a piece of NodeJS code and learn how to use some of its common modules. This is a simple application which keeps record of logs including errors, warnings and information.

The most noticeable point about this log server is the way it stores log data, which uses a sort of document-oriented database.


### Get the source

You can get the code from here: <a href='https://github.com/afshinm/nodejs-log-server'>https://github.com/afshinm/nodejs-log-server</a>

We’ll use Mongoose and Express modules in this application. You can simply run a small website or weblog using these two modules! I’ll be explaining each module at first and then we’ll take a look at the code.


### Modules  

<b>Mongoose:</b> It’s one of the best existing libraries for using mongodb through nodejs. Mongo is an open source document-oriented NoSQL database system.
Read more at: <a href='http://blog.learnboost.com/blog/mongoose/'>http://blog.learnboost.com/blog/mongoose/</a>.

<b>Express:</b> is a web framework for nodejs. Using Express, you can generate your website or application’s interfaces and define a dedicated route for each one of them (for instance, your weblog’s article list will be /list and details page for each article will be like /blog/id/1).
Read more at: <a href='http://expressjs.com/'>http://expressjs.com/</a>.


### Let's start

Let’s take a look at the actual code. First, we should call the two modules in the application:

	var app = require('express').createServer(),
	mongoose = require('mongoose'),

To easily create a schema, we’ll need to store it’s constructor in the Schema variable:

	Schema = mongoose.Schema, 


Afterward, we’ll create two arrays to store constant values of the application:

	priority = ['low', 'normal', 'high', 'critical'],
	logtype = ['information', 'warning' ,'error']; 


The first array is a list of possible priorities for logs and the second array is the log type. Now it’s time to connect to the database and create the respective schema:

	mongoose.connect('mongodb://localhost/logs');
	
	logItem = new Schema({
	    priority  : Number,
	    logtype   : Number,
	    datetime  : Date,
	    msg       : String
	});


As you can see, we are connected to the logs database and created our desired schema. This schema contains five fields which are log priority, log type, log creation date, and log message in order of appearance. After that, in the next line, we’ll introduce our model to the database:

	mongoose.model('logItem', logItem);


Our model name is logItem. In the next line you can see the definition of a route for the Express module, which tells the module to do some stuff when somebody enters the main root:

	app.get('/', function(req, res){ 


The callback method has got two parameters, where the first one will be containing the request data and the second one is the response variable. Using these two variables, we can do some stuff on a specific request or response. The following command will print some text on the output:

	res.send("Log saved on " + Date()); 


And then, on the application console:

	console.log("Log saved on " + Date()); 


### What is the console.log?

console.log is a simple method which prints some text on the application console (stdout). 
console.log accepts one parameter which is the desired text to be printed on the screen. It does something similar in JavaScript and Firebug. 
For example if we use console.log in JavaScript code on the client-side, we can see the printed text in the Firebug’s console.


<b>The only reason of using console.log is to know what the application is doing. Just this!</b>

In the next line we’ve defined a variable and fill it with request parameters:

	var reqQuery = req.query;


This variable is an object which contains all requested parameters (e.g. http://localhost/?foo=1&boo=2). The next line will get the model from the database:

	var logItem = mongoose.model('logItem');


We do that to be able to insert, delete and update database records. In the next two lines, using request parameters, we’ll define log type and priority:

	var pr = priority.indexOf(reqQuery["priority"]);
	var type = logtype.indexOf(reqQuery["type"]);


In this way, we are sure that the stored data is in the range we defined. And finally we create a new model object with the desired variables:

	new logItem({    
	    datetime: Date(),
	    priority: (pr >= 0 ? pr : 0),
	    logtype: (type >= 0 ? type : 0),
	    msg: reqQuery["msg"]})
	.save();


Calling save() method will save the object in the database. After all, we’ll run the application on a port (e.g. 3000):

	app.listen(3000); 


### Result

Now, after running the application, we can simply add a log to our database using the following url:
	http://localhost:3000/?msg=logtext&priority=high&type=errortext&priority=high&type=error 

Special thanks to my dear friend, <a href='http://fardinak.com/'>Fardin Koochak</a> for translating this article.