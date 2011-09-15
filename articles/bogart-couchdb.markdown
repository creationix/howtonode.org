Title: Blog with CouchDB, Bogart, and Node.js
Author: Nathan Stott
Date: Wed Sept 14 2011 09:50:00 GMT+0000 (UTC)
Node: v0.4.11

In this article, you will learn how to use Bogart and CouchDB to create a minimal
blogging engine.

## Pre-Requisites

### Bogart ###

Bogart is a Sinatra-like framework designed to make it easy to create JSGI compliant
web applications on node.js.

Bogart is in the npm registry.

    npm install bogart

### CouchDB ###

CouchDB is a document-oriented database with a RESTful interface.  CouchDB works well
with JavaScript since CouchDB speaks JSON.  Also, CouchDB is queried using 'views' that are,
by default, written in JavaScript.  [Download the latest release][http://couchdb.apache.org/downloads.html] 
from here.  CouchBase also maintains [debian and rpm packages][http://www.couchbase.com/downloads] 
for the community.

## JSGI

Bogart is a JSGI-based framework.  JSGI is specified by the CommonJS mailing list.  Knowledge
of JSGI is helpful when dealing with Bogart; however, it is not necesarry.  You can find
[more information about JSGI][http://wiki.commonjs.org/wiki/JSGI] on the 
[CommonJS wiki][http://wiki.commonjs.org].

## What will our application do?

To keep things simple, we're going to only tackle the most basic of functionality.  We will
support the following methods:

* Create a new post (POST /posts)
* Show a list of all the posts (GET /posts)
* Show a single post (GET /posts/:id)
* Comment on a post (POST /posts/:id/comments)

## Lets get startred!

A Bogart application consists of a JSGI server with one or more pieces of middleware and 
one or more Bogart routers.

The canonical 'Hello World' application in Bogart can be written as follows:

<bogart-couchdb/hello-world.js>

This JavaScript program defines a single route that accepts `GET` requests to the root of the
site and returns a simple HTML greeting.

To run this program, first execute the following commands to setup your blog directory:

    mkdir bogart-couchdb-blog
    cd bogart-couchdb-blog
    npm install bogart

This will create a new directory named bogart-couchdb-blog and install bogart to the 
node_modules subdirectory of this directory.  Next, copy the JavaScript into a file in
bogart-couchdb-blog named `app.js` and then execute

    node app.js

Visit [http://localhost:8080][http://localhost:8080] in your browser.

## Creating the package.json file

In order to manage dependencies, it is useful to create a `package.json` file.  This file
provides details on the packages you depend on so that you can more easily use `npm` to manage
these dependencies.

Create a file named `package.json` in your `bogart-couchdb-blog` directory.

<bogart-couchdb/package.json>

The most important field in this JSON file is the `dependencies` field.  This field will allow
you to execute `npm install` to install the dependencies for your project.

## Creating a Post

There are two routes that we will need in order to create a post.

* GET /posts/new -> returns a form to create a new post
* POST /posts -> creates a new post from the form parameters provided

The mustache template to create a new post is as follows:

<bogart-couchdb/new-post.html>

This post will be rendered inside of a layout to keep the look of the site consistant.
By convention, Bogart's view engine uses a file called `layout.html` as the layout if
it exists.  A Bogart layout is a template with a `{{{body}}}` tag to include the
view inside of the layout.

<bogart-couchdb/layout.html>

The route to return the new post template makes use of the `bogart.respond` helper.  
Even though it is not strictly necesarry to understand JSGI in order to use Bogart, 
lets go over the basic concept of a JSGI response.  Bogart routes expect a JSGI response 
or a promise that will resolve to a JSGI response to be returned. A JSGI response is an 
object that contains three attributes: status (required), body (required), and headers (optional).

A simple JSGI response:

    {
      status: 200,
      body: [ 'Hello World' ]
    }

The Bogart route to render new-post.html is as follows:

    get('/posts/new', function(req) {
      return viewEngine.respond('new-post.html', {
        locals: {
          title: 'New Post'
        }
      })
    });

`viewEngine` should be defined at the beginning of the Bogart configuartion closure as
    
    viewEngine = bogart.viewEngine('mustache')

Bogart supported `haml` and `mustache` out of the box.  It is easy to add support for more
view engines as well.

Bogart includes useful middleware to make working with forms easy.  Normally, req.body will
contain the raw body of a form post.  It is more conveniant if this is automatically converted to
a JSON object for us.  The Bogart middleware `ParseForm` accomplishes this.

We will make a small change to our application to add the `ParseForm` middleware into the JSGI stack.

    app = bogart.middleware.ParseForm(app);
    bogart.start(app);



## Adding a CouchDB view to retrieve posts