Title: A Simple Blog with CouchDB, Bogart, and Node.js
Author: Nathan Stott
Date: Wed Sept 14 2011 09:50:00 GMT+0000 (UTC)
Node: v0.4.11

In this article, you will learn how to use Bogart and CouchDB to create a minimal
blogging engine.

## Pre-Requisites

### npm ###

[npm](http://github.com/isaacs/npm) is the most popular package manager for Node.js.
Installing npm is easy.

    curl http://npmjs.org/install.sh | sh

A note for windows users: npm does not currently work on windows. It will in the future.

### Bogart ###

[Bogart](http://github.com/nrstott/bogart) is a Sinatra-like framework designed 
to make it easy to create JSGI compliant web applications for node.js.

Bogart is in the npm registry.

    npm install bogart

### CouchDB ###

[CouchDB](http://couchdb.apache.org) is a document-oriented database with 
a RESTful interface. CouchDB works well with JavaScript since CouchDB speaks JSON.
Also, CouchDB is queried using 'views' that are, by default, written in JavaScript.
[Download the latest release](http://couchdb.apache.org/downloads.html) from here.
CouchBase also maintains [debian and rpm packages](http://www.couchbase.com/downloads) 
for the community.

## JSGI

Bogart is a JSGI-based framework. JSGI is specified by the CommonJS mailing list. Knowledge
of JSGI is helpful when dealing with Bogart; however, it is not necesarry. You can find
[more information about JSGI](http://wiki.commonjs.org/wiki/JSGI) on the 
[CommonJS wiki](http://wiki.commonjs.org).

## Mustache

[Mustache](http://github.com/janl/mustache.js) is a minimal templating engine 
with {{mustaches}}. Mustache is the default templating engine of Bogart. 
When you install Bogart, you will also be installing Mustache.

## CouchDB-CommonJS

[CouchDB-CommonJS](http://github.com/nrstott/couchdb-commonjs) is a promise-based 
CouchDB library available in the npm registry. It can also be used in the browser 
or with Narhwal.

    npm install couchdb

## What will our application do?

To keep things simple, we're going to only tackle basic functionality. Our blog
application will support the following methods:

* Create a new post (POST /posts)
* Show a list of all the posts (GET /posts)
* Show a single post (GET /posts/:id)
* Comment on a post (POST /posts/:id/comments)

## Lets get startred!

A Bogart application consists of a JSGI server with one or more pieces of middleware and 
one or more Bogart routers each containing any number of routes.

The canonical 'Hello World' application in Bogart can be written as follows:

<bogart-couchdb/hello-world.js>

This JavaScript program defines a single route that accepts `GET` requests to the root of the
site and returns a simple HTML greeting.

To run this program, first execute the following commands to setup your blog directory:

    mkdir bogart-couchdb-blog
    cd bogart-couchdb-blog
    npm install bogart

This will create a new directory named bogart-couchdb-blog and install bogart to the 
node_modules subdirectory of this directory. Next, copy the JavaScript into a file into
bogart-couchdb-blog and name it `hello-world.js` and then execute

    node hello-world.js

Visit [http://localhost:8080](http://localhost:8080) in your browser.

## Creating the package.json file

In order to manage dependencies, it is useful to create a `package.json` file. This file
provides details on the packages you depend on so that you can more easily use `npm` to manage
these dependencies.

Create a file named `package.json` in your `bogart-couchdb-blog` directory.

<bogart-couchdb/package.json>

The most important field in this JSON file is the `dependencies` field. This field will allow
you to execute `npm install` to install the dependencies for your project.

## Creating a Post

There are two routes that we will need in order to create a post.

* GET /posts/new -> returns a form to create a new post
* POST /posts -> creates a new post from the form parameters provided

The mustache template to create a new post is as follows:

<bogart-couchdb/new-post.html>

This post will be rendered inside of a layout to keep the look of the site consistant.
By convention, Bogart's view engine uses a file called `layout.html` as the layout if
it exists. A Bogart layout is a template with a `{{{body}}}` tag to include the
view inside of the layout.

<bogart-couchdb/layout.html>

The route to return the new post template makes use of the `bogart.respond` helper. 
Even though it is not strictly necesarry to understand JSGI in order to use Bogart, 
lets go over the basic concept of a JSGI response. Bogart routes expect a JSGI response 
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

Bogart supported `haml` and `mustache` out of the box. It is easy to add support for more
view engines as well.

Bogart includes useful middleware to make working with forms easy. Normally, req.body will
contain the raw body of a form post. It is more conveniant if this is automatically converted to
a JSON object for us. The Bogart middleware `ParseForm` accomplishes this.

We will make a small change to our application to add the `ParseForm` middleware into the JSGI stack.

    app = bogart.middleware.ParseForm(app);
    bogart.start(app);

Lets take a side-step to discuss how we can work with CouchDB using the `couchdb` package
from the npm registry.

At the top of our `app.js` add the following:

    var couchdb = require('couchdb');

In the closure that configures Bogart routes, create a couchdb client and a database representation.

    var app = bogart.router(function(get, post, put, destroy) {

      var client     = couchdb.createClient(5984, '127.0.0.1', { user: 'myuser', password: 'mypass' })
        , db         = client.db('blog')
        , viewEngine = bogart.viewEngine('mustache');
      
      // configure routes...
    });

This creates a couchdb client connecting to '127.0.0.1' and port 5984. If your CouchDB is in
Admin Party, you do not need to supply the user and password in an options hash. If you have a 
CouchDB users setup, please provide your username and password.

Now we will create a route to handle the `POST` of our form.

    post('/posts', function(req) {
      var post = req.params;
      post.type = 'post';

      return db.saveDoc.then(function(resp) {
        return bogart.redirect('/posts');
      });
    });

We add the `type` attribute to the `post` so that as we add more document types in the future,
we can easily create CouchDB views to find only specific document types. This is not a built-in
CouchDB concept. It is a useful convention that makes creating views simpler.

## Adding a CouchDB view to retrieve posts

CouchDB is queried using [map/reduce views](http://wiki.apache.org/couchdb/HTTP_view_API) 
that are defined on design documents. This means that we need to create a design
document before we can query a list of the posts in our database.

Lets create a JavaScript file `syncDesignDoc.js` in the `lib` directory of our project.

<bogart-couchdb/syncDesignDoc.js>

Execute `node lib/syncDesignDoc.js` to update the database with the latest design document.

## Listing Posts

Lets create a Mustache template to list the posts from our database.

<bogart-couchdb/posts.html>

Next, lets create a Bogart route to render this template. We will query the database using
`db.view`, process the response from CouchDB, and respond with the rendered template. Bogart
makes this easy:

      get('/posts', function(req) {
    
        return db.view('blog', 'posts_by_date').then(function(resp) {
          var posts = resp.rows.map(function(x) { return x.value; });
          
          return viewEngine.respond('posts.html', {
            locals: {
              posts: posts
            }
          });
        });
      });

## Show an Individaul Post

It's time to create a route to show an individual post. This page will also contain
a form for adding comments.

The template will be as follows:

<bogart-couchdb/post.html>

The Bogart route to display this is as simple as the route to display the form
for creating new posts.

    get('/posts/:id', function(req) {
      return db.openDoc(req.params.id).then(function(post) {
        return viewEngine.respond('post.html', { locals: post });
      });
    });

The route to accept the `POST` from the comments form is similar to the route to accept
a new blog post:

    post('/posts/:id/comments', function(req) {
      var comment = req.params;

      return db.openDoc(req.params.id).then(function(post) {
        post.comments = post.comments || [];
        post.comments.push(comment);

        return db.saveDoc(post).then(function(resp) {
          return bogart.redirect('/posts/'+req.params.id);
        });
      });
    });

## Summing it up

As you can see, getting started with Bogart and CouchDB is simple. We are a long way from 
having a full-featured blog, but hopefully this will inspire some out there to try
working with Node.JS, Bogart, and CouchDB!

The full source code of the finished `app.js` is below:

<bogart-couchdb/app.js>
