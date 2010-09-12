Title: An Introduction to Geddy
Author: Matthew Eernisse
Date: Sat Sep 11 2010 17:02:05 GMT-0700 (PDT)
Node: v0.2.1

This was the fifth in a series of posts leading up to
[Node.js Knockout][] on how to use [node.js][]. This post was
written by [geddy][] author and [Node.js Knockout judge][] Matthew
Eernisse.

Geddy is a modular, full-service web framework for Node.js, similar
to Merb, Rails, Pylons, or Django.

Geddy provides a lot of great features:

-   Flexible, robust router with easy RESTful routing
    [(router docs)][]
-   Intelligent content-negotiation [(content-negotiation docs)][]
-   Models and validations[(model docs)][]
-   Simple, intuitive views with partials support
-   Generator utility for easy creation of apps and scaffolding

## Installation

There are a few different ways of getting Geddy.

Download the current release, [geddy-v0.1.1.tar.gz][] (2010-08-06)

    $ ~/work$ curl -O http://geddyjs.org/dist/geddy-v0.1.1.tar.gz
    $ ~/work$ tar -xvzf geddy-v0.1.1.tar.gz
    $ ~/work$ cd geddy-v0.1.1
    $ ~/work$ make && sudo make install

Or, get the latest Geddy code from GitHub and install it:

    $ ~/work$ git clone git://github.com/mde/geddy.git
    $ ~/work$ cd geddy
    $ ~/work$ make && sudo make install

Geddy can also now be installed with NPM:

    $ npm install geddy

If you want to use a database, you'll need database bindings for
Node (The Geddy GitHub wiki has docs for setting up [SQLite][] or
[Postgres][]). CouchDB does not require database bindings.

NOTE: For Postgres, your database user must have the ability to
create databases and tables.

### Create an app

Create your Geddy app:

    $ ~/work$ geddy-gen app bytor
    Created app bytor.

Check if your app runs:

    $ ~/work/bytor$ geddy
    Geddy worker (pid 5206) running at port 4000 (development mode)

Go to [http://localhost:4000/][] — you should see the following:

“Attention all planets of the Solar Federation”

Geddy has some startup options you can see by doing `geddy -h` or
`geddy --help`.

## RESTful routes

Create a resource-based route with a model stub using
`geddy-gen resource [model_name]`:

    $ ~/work/bytor$ geddy-gen resource snow_dog
    [ADDED] ./app/models/snow_dog.js
    [ADDED] ./app/controllers/snow_dogs.js
    resources snow_dogs route added to ./config/router.js
    Updated inflections map.
    Created view templates.

Geddy's pluralization code isn't that smart yet — if you want a
special plural, add it with a comma after the model name (e.g.
`geddy-gen resource foo,fooes`).

There is a nice [wiki doc for Geddy's router][(router docs)].

Test your RESTful routes:

    $ ~/work/bytor$ geddy
    Geddy worker (pid 5206) running at port 4000 (development mode)

Go to [http://localhost:4000/snow\_dogs.html][]. You should see the
following:

Params

-   extension: html
-   controller: SnowDogs
-   action: index
-   method: GET

This is just printing out the contents of the `params` object in
the action.

Now go to [http://localhost:4000/snow\_dogs.json][]. You should see
the following:

{"params":{"method":"GET","controller":"SnowDogs","action":"index","format":"json"}}

This is Geddy's content-negotiation at work. Geddy tries to do the
right thing based on the formats your controller supports, and what
the client wants.

There is more detailed info on
[Geddy's content-negotiation in the wiki doc][(content-negotiation docs)].

## Model properties, etc.

Kill the server (Ctrl+c), and change your model as desired.

    $ ~/work/bytor$ vi app/models/snow_dog.js

Add some properties, validations, methods:

<introduction-to-geddy/models/snow_dog.js>

[The wiki doc on models][(model docs)] has more detailed info.

## DB config

Turn on database support. Edit your development config file:

    $ ~/work/bytor$ vi config/environments/development.js

Set the appropriate values in config.database. See the wiki doc on
[sample DB configs][] for examples.

Create the database.

(Remember, with Postgres, your database user has to have enough
privileges to create a database.)

    $ ~/work/bytor$ geddy-gen db:create
    Creating DB for development.js...

## Scaffold

Generate your scaffold from the model file you just edited:

    $ ~/work/bytor$ geddy-gen scaffold snow_dog
    Created client-side model JavaScript files.
    Created controller and views for snow_dog.

Fire up the server again:

    $ ~/work/bytor$ geddy
    Geddy worker (pid 5206) running at port 4000 (development mode)

Go to [http://localhost:4000/snow\_dogs.html][], and start
creating, editing, removing items.

That’s pretty much it.

The query API for Geddy's models is still pretty limited — it
supports only find-by-id and find-by-type. You can take a look at
the code in your controller for a closer look at the API.

## Get involved

You can help out with Geddy by filing bug reports on GitHub here:

[http://github.com/mde/geddy/issues][]

If you have questions, problems, or feature ideas, you can shoot an
e-mail to the mailing list here:

[http://groups.google.com/group/geddy][]

And of course, you can always [fork Geddy on GitHub][], make
improvements, and send a pull request.

  [Node.js Knockout]: http://nodeknockout.com/
  [node.js]: http://nodejs.org/
  [geddy]: http://geddyjs.org/
  [Node.js Knockout judge]: http://nodeknockout.com/judging#matthew_eernisse
  [(router docs)]: http://wiki.github.com/mde/geddy/using-the-router
  [(content-negotiation docs)]: http://wiki.github.com/mde/geddy/content-negotiation
  [(model docs)]: http://wiki.github.com/mde/geddy/models
  [geddy-v0.1.1.tar.gz]: /dist/geddy-v0.1.1.tar.gz
  [SQLite]: http://wiki.github.com/mde/geddy/install-sqlite-and-node-sqlite
  [Postgres]: http://wiki.github.com/mde/geddy/install-postgresql-and-node_postgres
  [http://localhost:4000/]: http://localhost:4000/
  [http://localhost:4000/snow\_dogs.html]: http://localhost:4000/snow_dogs.html
  [http://localhost:4000/snow\_dogs.json]: http://localhost:4000/snow_dogs.json
  [sample DB configs]: http://wiki.github.com/mde/geddy/sample-db-configs
  [http://github.com/mde/geddy/issues]: http://github.com/mde/geddy/issues
  [http://groups.google.com/group/geddy]: http://groups.google.com/group/geddy
  [fork Geddy on GitHub]: http://github.com/mde/geddy