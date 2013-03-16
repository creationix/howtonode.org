Title: Powerful Search with Express and MongoDB
Author: Michael Bosworth
Date: Thu Mar 15 2013 21:28:42 GMT+0000 (UTC)
Node: v0.8.22

There are many ways to implement search and usually there is a specific need that you trying to meet.  This may not be the search you are looking for, but it is a powerful one to leverage if ever the need arise!  I'm talking about compounding search terms to match documents stored in [mongoDB][].  My use case is an employee directory.  I don't know the persons name, but I should be able to type the persons team and office location and be able to narrow it down.  Let's get started!

###Sample Data###

For this example, we will use a very simple data set.  We will process this data and insert it into mongo.

<search-with-express-and-mongodb/data.json>

###Building A Index Attribute###

To accomplish a compound search we are going to leverage [mongoDB][]'s support for regex.  Since there is no easy way match a pattern against all the attributes in a document, we will flatten the data into a index attribute and test for matches there.  For simplicity, I am using the [mongojs][] node module.  To see where this code lives in the context of Express visit the [example project][].  

<search-with-express-and-mongodb/import.js>

Once the import has run, the {"first":"John"} document in mongo should look like this.  Notice the index attribute has contactinated all of John's information. 

<search-with-express-and-mongodb/john.json>

###Express###

Now that our data is in monogoDB, we create a simple express server that will accept and process our query for data.  For now, our route just returns all the data from the employees collection.  Let's incoporate some regex and make it better. 

<search-with-express-and-mongodb/express.js>

###Singular Matching###

To start, we want to take the term that comes in from the request and match that term against the index string of each document and return the results.  All this requries is a minor tweak in our route.  The Regex pattern is simple.  Match the whole term passed.  Match it globally ("g") and be INsensitive to case ("i").

<search-with-express-and-mongodb/single-match-route.js>

This gives us some pretty powerful results.  We can search for any attribute of the document and get a match.  We can even use partial words and get a match!  You can see how powerful this would be provided a rich realtime front end.  Maybe we will tackle that in a different post.  

<img src="/search-with-express-and-mongodb/mil.png" />

###Compound Matching###

We are getting close.  Let's take what we've built and allow for multiple terms to be matched.  For this, we need a delimiter, or something to denote from the query when a new term is starting or ending.  Then we know how to parse it.  Because I want users to use english-like sentences in searching, I'm just going to user a space (" ").  

Before we tweak our route again, we need a function to build our RegEx patterns.  We need this function to be a little bit more robust than our single pattern match and strip white space (in the case of a double space).

<search-with-express-and-mongodb/regex.js>

Before we tweak our route, we need to learn something about MongoDB.  While Mongo querys are written in JSON, Mongo supports several custom operators for performing more advanced queries.  For a list of those checkout the [Mongo docs][].  We are going to use the $all operator.  This operator accepts and array of queries and ALL OF THEM have to be true in order for it to be included in the result.  We will leverage this to build and array of, you guessed it, Regex patterns and match them against the index string.  

<search-with-express-and-mongodb/compound-match-route.js>

Search is at a whole new level.  The nice thing about regex is that I can be lazy.  I can just search for "mil" and narrow my results down to two employees.  If I query "mil hum", short of course for employees working in Milwaukee's Human Resources department, then I narrow my result down to one and I don't have to know the persons name.  Also note that we can search for employees based on the phone or email.   The algoritm gives us freedom to query from any angle.

###Concerns###

I'm sure red flags went off for you around the data import section.  "Redundancy!", you cried!  Yes, admit it, I'm not making good use of the resources on the hard disk.  You'll have to weigh the pros and cons based on how big your data set is.  And who knows, maybe there is a better way to get the same results.

Enjoy!

__Boz__.

[git]: http://git-scm.com/
[node]: http://nodejs.org
[npm]: http://npmjs.org/
[express]: http://github.com/visionmedia/express
[mongoDB]: http://www.mongodb.org
[Express and MongoDB]: /express-and-mongodb
[mongojs]: https://github.com/gett/mongojs.git
[example project]: https://github.com/bozzltron/search-with-express-and-mongodb
[Mongo docs]:http://docs.mongodb.org/manual/