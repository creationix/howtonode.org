Title: Node.js and MarkLogic - Getting started with MLJS
Author: Adam Fowler
Date: Thu Apr 17 2014 08:55:00 GMT+0100 (BST)
Node: v0.10.22

MarkLogic is an Enterprise class NoSQL database. It can store and manage text, XML, JSON and binary documents.
It's REST API allows connection from a variety of application platforms, including NodeJS. Many wrappers are
available for PHP, Ruby on Rails, Java, and JavaScript.

This article will explain how to use the Apache 2 licensed MLJS Core API from Node.js to perform basic document
and advanced search functionality.

## Installing MarkLogic

First off, go download the MarkLogic Enterprise Developer licensed installation from [The developer site](http://developer.marklogic.com/products)

This is available for Mac, Windows and Linux (RedHat and CentOS). Be sure to double check the
[installation guide](http://docs.marklogic.com/guide/installation/intro#chapter) for required
hardware and software specs

The installation is pretty simple. On Linux you'll need some extra RPM packages mentioned in the above doc. On Mac and Windows
it's a simple case of running an installer and you're ready to go.

This tutorial assumes you will use the default localhost install with username/password set to admin/admin.

Once installed ensure it is running through windows services/mac preferences/Linux init.d scripts.

Now visit [http://localhost:8001/](http://localhost:8001/) from your browser and request a 'Enterprise Developer' License. You'll be told MarkLogic
is restarting, after which you can now use all MarkLogic functionality.

MarkLogic is not just a NoSQL Document database. It's also a triple store with W3C graph store protocol and SPARQL support,
and a very capable search engine with full text, document structure (e.g. 'has element'), geospatial and semantic query support.

We'll concentrate on document storage and search today.

## What is MLJS?

MLJS is an Open Source Apache 2 licensed wrapper around the REST API of MarkLogic. This provides simple function calls to
access database functionality in MarkLogic.

MLJS has three layers:-

 - MLJS Core Connection - The MLJS Object itself acts as the DB connection object
 - MLJS Core Contexts - Higher level objects allow co-ordination of multiple events that affect state. Like a document's metadata being updated, or search facet being clicked
 - MLJS Browser - Browser only (Non node.js) layer, with 39+ UI widgets for 2 and 3 tier applications on top of MarkLogic

Both MLJS Core layers can be used in Node.js. This tutorial will concentrate just on the MLJS Core Connection library though,
which underpins all the other functionality

## Get MLJS installed

Create a new project folder and execute:-

    $ npm install mljs

This will get the latest stable MLJS version from NPM and install in your app.

Alternatively you can download the latest source for master or dev branches of MLJS from [GitHub](https://github.com/adamfowleruk/mljs).

## Get a connection

First you'll need to get a connection. MLJS defaults it's connection settings to a default MarkLogic installation on localhost.

We'll use the pre-installed Documents database for our testing:-

    // app.js
    var mljs = require("mljs");

    var db = new mljs({database: "Documents"});

    db.exists(function(result) {
      if (result.inError) {
        console.log("Uh oh - error: " + result.details);
      } else {
        console.log("Exists?: " + result.exists);
      }
    });

This pattern of a callback from all functions as the last parameter is the same throughout the MLJS object.

The result object always has an inError flag set by the mljs object. This should always be checked.

## Save a document

Now we'll save a JSON document. the db.save method accepts text, JSON, XMLDocument and binary inputs and saves the content appropriately in MarkLogic.

    // app.js
    var doc = {title: "Adam's poem", rating: 1, poem: "There's was an old database from Rome, who hated to be on his own.\nHe got connected to Node, and went on the road, and discovered lots of friends far from home."};

    db.save(doc, "/poems/1.json", function(result) {
      if (result.inError) {
        console.log("Uh oh - error: " + result.details);
      } else {
        console.log("Doc saved with URI: " + result.docuri);
      }
    });

## Find the document

Now we'll check it's in there and pull it back using full text search. You can get really advanced in MarkLogic using geospatial
and range queries, but I don't want to write an article about configuring indexes! So I'll keep it just to word queries.

MarkLogic includes a universal index which indexes all document structure, element/property values, words, stems and phrases. This
is always turned on. We'll use word queries today.

Because MarkLogic has so many query options, the query config can get quite hairy pretty quick. Thankfully MLJS includes a query builder
object to make this simpler.

MarkLogic also includes a high level search grammar. This is basically similer to typing a search query in to Google. You just provide a string
which may include NOT, OR and AND, GT or LT for numeric comparisons, and ( and ) to nest terms.

    // app.js
    db.search("rome AND node",function(result) {
      if (result.inError) {
        console.log("Uh oh - error: " + result.details);
      } else {
        console.log("query results: \n" + JSON.stringify(result.doc));
      }
    });

The result.doc always holds the document coming back from MarkLogic. In this example, this is a JSON search result document.

This has various information on it, including result size, document text snippets, and metrics on how long search processing took.

Note that our results include a highlight element. This shows the specific parts of the snippet from the document that match our query.
Namely the words rome and node in our document.

## Test it out

Now just run the app in the console!

    $ node app.js

You'll see all the above output.

## In summary

The pattern shown above is the same for all calls on the core MLJS object. Whether it's geospatial search, basic text query, or even
queries that perform aggregation and analytics operations by extracting, say, the average rating of all poem documents.

MLJS has higher level objects called Contexts that make query interaction even simpler. They abstract the underlying mljs object calls.

On the browser, separate from Node.js, you can plug these objects in to MLJS widgets that show a visual representation of documents,
queries and search results - including SPARQL semantic queries.

There's a rich vein of functionality available in Node.js. This even includes real time alerts being fired to your browser via WebSockets.

To see this and further examples visit GitHub: [MLJS GitHub](https://github.com/adamfowleruk/mljs)

The alerting server object for Node.js can be found here: [MLJS webserver](https://github.com/adamfowleruk/mljs/blob/master/mljs-webserver.js)

Detailed MLJS documentation is available here: [MLJS GitHub Wiki](https://github.com/adamfowleruk/mljs/wiki)

I often detail MLJS advances on my blog, please visit: [http://adamfowlerml.wordpress.com](http://adamfowlerml.wordpress.com)

Enjoy!

FYI Thu full app file is available below:-


<node-js-and-marklogic-getting-started-with-mljs/app.js>
