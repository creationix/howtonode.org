Title: Node.js and MongoDB
Author: Node Knockout
Date: Sat Sep 11 2010 17:14:05 GMT-0700 (PDT)
Node: v0.2.1

This was the sixth in a series of posts leading up to
[Node.js Knockout][] on how to use [node.js][]. This post was
written by [10gen][] and [is cross-posted from their blog][].

[10gen][1] is the corporate sponsor of [MongoDB][]. MongoDB bridges
the gap between key-value stores (which are fast and highly
scalable) and traditional RDBMS systems (which provide rich queries
and deep functionality).

## Node and MongoDB

Node.js is turning out to be a framework of choice for building
real-time applications of all kinds, from analytics systems to chat
servers to location-based tracking services. If you're still new to
Node, check out [Simon Willison's excellent introductory post][].
If you're already using Node, you probably need a database, and you
just might have considered using MongoDB.

The rationale is certainly there. Working with Node's JavaScript
means that MongoDB documents get their most natural representation
- as JSON - right in the application layer. There's also
significant continuity between your application and the MongoDB
shell, since the shell is essentially a JavaScript interpreter, so
you don't have to change languages when moving from application to
database.

## Node.js MongodB Driver

Especially impressive to us at 10gen has been the community support
for Node.js and MongoDB. First, there's Christian Kvalheim's
excellent [mongodb-node-native project][], a non-blocking MongoDB
driver implemented entirely in JavaScript using Node.js's system
libraries. The project is a pretty close port of the
[MongoDB Ruby driver][], making for an easy transition for those
already used to the 10gen-supported drivers. If you're just
starting, there's a helpful [mongodb-node-native mailing list][].

## Hummingbird

Need a real-world example? Check out [Hummingbird][], Michael
Nutt's real-time analytics app. It's built on top of MongoDB using
Node.js and the mongodb-node-native driver. Hummingbird, which is
used in production at [Gilt Groupe][], brings together an
impressive array of technologies; it uses the [express.js][]
Node.js app framework and sports a responsive interface with the
help of web sockets. Definitely worth checking out.

## Mongoose

Of course, one of the admitted difficulties in working with Node.js
is dealing with deep callback structures. If this poses a problem,
or if you happen to want a richer data modeling library, then
[Mongoose][] is the answer. Created by [Learnboost][], Mongoose
sits atop mongodb-node-native, providing a nice API for modeling
your application.

  [Countdown to Knockout: Post 6 - Node.js and MongoDB]: http://nodeknockout.posterous.com/countdown-to-knockout-post-6-nodejs-and-mongo-0
  [Node.js Knockout]: http://nodeknockout.com/
  [node.js]: http://nodejs.org/
  [10gen]: http://mongodb.org/
  [is cross-posted from their blog]: http://blog.mongodb.org/post/812003773/node-js-and-mongodb
  [1]: http://www.10gen.com/
  [MongoDB]: http://www.mongodb.org/
  [Simon Willison's excellent introductory post]: http://simonwillison.net/2009/Nov/23/node/ "Node.js is genuinely exciting"
  [mongodb-node-native project]: http://github.com/christkv/node-mongodb-native "MongoDB Node Native Driver"
  [MongoDB Ruby driver]: http://www.mongodb.org/display/DOCS/Ruby+Language+Center "MongoDB Ruby Driver"
  [mongodb-node-native mailing list]: http://groups.google.com/group/node-mongodb-native "MongoDB Node Native Mailing List"
  [Hummingbird]: http://mnutt.github.com/hummingbird/ "Hummingbird App"
  [Gilt Groupe]: http://www.gilt.com/ "Gilt Groupe"
  [express.js]: http://expressjs.com/ "Express.js"
  [Mongoose]: http://www.learnboost.com/mongoose/ "Mongoose"
  [Learnboost]: http://www.learnboost.com/ "Learnboost"