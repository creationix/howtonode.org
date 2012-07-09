Title: Node.js and MongoDB - Getting started with MongoJS
Author: Srirangan
Date: Mon Feb 06 2012 21:15:00 GMT+0530 (IST)
Node: v0.6.10

It won't be an exaggeration if one claims that in the past few months Node.js and MongoDB have literally taken the 
software and web industries by storm.

Not just bleeding-edge startups but even medium and large enterprises are leveraging these two technologies to deliver 
a better experience to their users by build more capable, performant and scalable apps.

So what is Node.js?

> Node.js is a platform built on Chrome's JavaScript runtime for easily building fast, scalable network applications. 
> Node.js uses an event-driven, non-blocking I/O model that makes it lightweight and efficient, perfect for 
> data-intensive real-time applications that run across distributed devices.

..and what is MongoDB?

> MongoDB is a scalable, high-performance, open source NoSQL database.

This post will cover the basics and get you started with your Node.js + MongoDB app. Make sure you have Node.js 
installed and MongoDB setup on your developer machine.

Let's verify your Node.js installation and start the MongoDB server:

    $ node -v
    $ mongod

## Introducing MongoJS
MongoJS is a brilliant little Node.js package that lets you access MongoDB using an API that is extremely similar to
MongoDB's JavaScript shell.

## Installing MongoJS
Once Node.js has been setup correctly on your machine, you can use its internal package manager NPM to install MongoJS:

    $ npm install mongojs

We can now start building our JavaScript application and connect to our MongoDB server:

    // app.js
    var databaseUrl = "mydb"; // "username:password@example.com/mydb"
    var collections = ["users", "reports"]
    var db = require("mongojs").connect(databaseUrl, collections);

The databaseUrl can contain the database server host and port along with the database name to connect to. By default
the host is “localhost” and the port is “27017“. If you're using the default, which is likely on a developer
environment, the databaseUrl can contain just the actual database name for our app.

The collections is a set (array) of collections our application uses. It isn't mandatory but is preferred as it allows
us to emulate a MongoDB JavaScript client like API within our Node.js app.

Here's an example for finding documents within a collection specifically in this case to find all female users.

    // app.js
    db.users.find({sex: "female"}, function(err, users) {
      if( err || !users) console.log("No female users found");
      else users.forEach( function(femaleUser) {
        console.log(femaleUser);
      } );
    });

Notice how our initial query is a near duplication of the corresponding query in MongoDB's console. In addition to the
query, in our Node.js source code (i.e. app.js) we pass a callback function to handle the results of the query.

Node.js implements an event based concurrency paradigm and almost everything is always a callback. This allows your
Node.js app to be non-blocking and high performing.

What happens in our specific callback is self-explanatory — we check for errors and results, and if the query returns
female users they are logged to the console.

Okay, how do I save a new user in my collection? Exactly how you would do it in the console, your code will look like
this:

    // app.js
    db.users.save({email: "srirangan@gmail.com", password: "iLoveMongo", sex: "male"}, function(err, saved) {
      if( err || !saved ) console.log("User not saved");
      else console.log("User saved");
    });

Here's an example for updating a record / document:

    // app.js
    db.users.update({email: "srirangan@gmail.com"}, {$set: {password: "iReallyLoveMongo"}}, function(err, updated) {
      if( err || !updated ) console.log("User not updated");
      else console.log("User updated");
    });

Okay, now we run this app in the console:

    $ node app.js

And there we have it, an incredibly simple quick start for Node.js + MongoDB enthusiasts. Happy coding!

