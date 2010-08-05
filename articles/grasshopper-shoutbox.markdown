Title: Shoutbox with Grasshopper and CouchDB
Author: Chandra Sekar S
Date: Thu Aug 05 2010 19:03:56 GMT+0530 (IST)
Node: v0.1.103

This article demonstrates how a simple shoutbox can be built with [Grasshopper][] using CouchDB for storing the shouts.  It is inspired by [this article][attribution] on Nettuts+. I have included the design artifacts from Dan's post to retain the look and feel of the final result.

If do not want to type in the code yourself, look at the [complete source code][source] for this article.  The completed application would look like this.

<img src="grasshopper-shoutbox/shoutbox.png" style="float: none"></img>

## Setting Up

To follow this article [git][], [node.js][], [npm][], [Grasshopper][] and [CouchDB][] have to be installed and configured on your system.

### git

Follow [these instructions][gitInstall] to install git on your system.

### node.js

This article has been written for v0.1.103 of node.js.  Follow [these instructions][nodeInstall] for getting node installed on your system.

### npm

npm is a package manager for node.js.  It takes care of dependency management when installing node.js modules.  Issue this command to install npm.

    wget -qO- http://npmjs.org/install.sh | sudo sh

### Grasshopper

Grasshopper is a feature-rich and flexible web application framework for node.js with support for most of the features web applications would need.  Install it with this command.

    sudo npm install grasshopper

### CouchDB

Follow the [installation instruction][couchInstall] on couch wiki to get CouchDB installed for your platform.


### CouchDB Module for node.js

Install the CouchDB module for node.js ([node-couchdb][]) using these commands.

    git clone http://github.com/felixge/node-couchdb.git
    cd node-couchdb
    sudo npm install

## Creating the Application

Grasshopper does not impose any specific structure in which the files of you project should be organized.  For our shoutbox, we'd be using this directory structure.

    shoutbox/
    |-- app
    |   |-- controller.js
    |   |-- model.js
    |   `-- shoutRepository.js
    |-- boot.js
    |-- createdb.js
    |-- images
    |-- stylesheets
    `-- views
        |-- index.html
        `-- layout.html

From this point all locations mentioned will be relative to the 'shoutbox' directory.  Create it with this command.

    mkdir -p shoutbox/{app,images,stylesheets,views}

Create the CouchDB database for storing shouts by creating a file named `createdb.js` with the following content and executing it with `node createdb.js`.

<grasshopper-shoutbox/createdb.js>

## Model

In an application following the MVC pattern, models are meant to hold the domain related data and business logic.  Grasshopper provides various features like, validation and ability to update models from request parameters, to make the development of your application's model layer simple.

Our shoutbox application has a single model named `Shout` in `app/model.js`.

<grasshopper-shoutbox/app/model.js>

We create a simple class named `Shout` and initialize it using `gh.initModel()`.  This method mixes validation and updation methods into the model class.  It takes the constructor of the model and the properties of the model as arguments. It creates a method for each property on the model which is used to read and write a field whose name is the property name prefixed with a '_'. For example, name() to read and write _name. The method reads the field if no argument is passed else writes the given value.

We then add the necessary validations.  We have hard coded the error messages as we don't care about internationalization here.  The [validation API][] of Grasshopper does a lot more.

We also add a function to generate an MD5 hash of the email which will be needed to retrieve the Gravatar for shouts.

## Repository

[Repositories][] are used for data access.  Let's create a repository to store and retrieve shouts from our CouchDB database using [node-couchdb][] in `app/shoutRepository.js`. The `save()` function saves a shout as a CouchDB object, while the `all()` function retrieves all documents in the database as an array of `Shout` instances.

<grasshopper-shoutbox/app/shoutRepository.js>

## Controller

Controllers deal with receiving the request, doing the necessary work through models and repositories and generating the response.  They are associated with a specific URL patterns.  Controllers in Grasshopper are just functions which are invoked with a `RequestContext` as the `this` context.

Our Shoutbox has 2 controllers, one to display all the available shouts along with a form to add new shouts and another to save new shouts and redirect back to the previous list.

### Controller to list shouts

This controller reads all the shouts from the repository, adds them to the model of the current `RequestContext` (not to be confused with application models).  It then renders the `index` view (note that the view name doesn't include an extention).

    gh.get('/', function() {
        var self = this;
        shoutRepo.all(function(err, shouts) {
            self.model['shout'] = new Shout();
            self.model['shouts'] = shouts;
            self.render('index');
        });
    });

`self.model['shout'] = new Shout();` is needed as the index view includes a form which uses a `Shout` model to add new a shout.

### Controller to save a shout

This controller creates a new `Shout` and updates its properties from the 'shout' object in request parameters.  It then checks if the new shout is valid and saves it to the database through the repository and redirects back to the previous controller.

It also sets a flash message thanking the user for shouting.  Flash messages are not lost during redirection.  They are retained until the next non-redirect response.  This makes it useful for displaying notifications to the user after a [PRG][].

If the input is invalid, it adds the invalid shout to the model and renders the `index` view again which displays the errors.  It also loads all the shouts as the page would display existing shouts along with the error messages.

    gh.post('/', function() {
        var self = this;
        var shout = new Shout().update(this.params['shout']);
        if(shout.isValid()) {
            shoutRepo.save(shout, function() {
                self.flash['success'] = 'Thanks for shouting!';
                self.redirect('/');
            });
        } else {
            shoutRepo.all(function(err, shouts) {
                self.model['shouts'] = shouts;
                self.model['shout'] = shout;
                self.render('index');
            });
        }
    });

The complete `app/controller.js` looks like this.

<grasshopper-shoutbox/app/controller.js>

## Layout

Grasshopper allows having an application wide layout into which the views of requests would be embedded.  You can specify the layout file of your application with this configuration.

    gh.configure({
        layout: 'views/layout'
    });

The layout file can use this piece of code to specify the location where the contents of the views have to be included.

    <%= include(view) %>

The layout for our shoutbox would look like this.

<grasshopper-shoutbox/views/layout.html>

## View

Views deal with presenting the data available in the model of the current request context to the user.  They also deal with accepting user input and displaying validations results.  Views in Grasshopper can embed javascript with `<% %>` for code to be executed and `<%= %>` for code whose value is to be included in the response.

Our shoutbox has a single view as it does all the work on a single page.  At the top the page it displays all the errors in the shout if any.  It uses the `errors()` view helper to retrieve all the error messages in the shout as an array.  It then checks whether there is a flash message available to be displayed and displays it.

    <% if(shout.errors) { %>
        <p class="error">
            <%= errors(shout).join('</p><p class="error">') %>
        </p>
    <% } %>
    <% if(flash['success']) { %>
        <p class="success"><%= flash['success'] %></p>
    <% } %>

It then lists all the available shouts including the name and gravatar of the person who shouted.

    <ul>
        <% shouts.forEach(function(shout) { %>
            <li>
                <div class="meta">
                    <img src="http://www.gravatar.com/avatar/<%= shout.mailHash() %>" 
                         alt="Gravatar" />
                    <p><%= h(shout.name()) %></p>
                </div>
                <div class="shout">
                    <p><%= h(shout.message()) %></p>
                </div>
            </li>
        <% }); %>
    </ul>

A form for adding new shout is included.  Note how the `name` attribute is given values prefixed with 'shout'.  This is not necessary in this simple example where we accept data for only one model.  This practice can come handy when accepting data for more than one model within the same form.

    <form action="/" method="post">
        <h2>Shout!</h2>

        <div class="fname">
            <label for="name"><p>Name:</p></label>
            <input type="text" name="shout.name" value="<%= shout.name() %>" size="20" />
        </div>

        <div class="femail">
            <label for="email"><p>Email:</p></label>
            <input type="text" name="shout.email" value="<%= shout.email() %>" size="20" />
        </div>

        <textarea name="shout.message" rows="5" cols="40"><%= shout.message() %></textarea>

        <p><input type="submit" value="Submit" /></p>
    </form>

Here is the complete code of the view.

<grasshopper-shoutbox/views/index.html>

## Making it all work

Download the [images and CSS][design] and extract them into your `shoutbox` directory.

Create a file named `boot.js` and put the following content in it.

<grasshopper-shoutbox/boot.js>

We're configuring Grashopper to use `views/layout` (extension not required) as layout file for the application and ask it to find all view templates within the `views` directory.  Start the application with `node boot.js` and point your browser to <http://localhost:8080>.

## Happy Shouting!

There we have a nice looking shoutbox which takes care of validations and thanks users for shouting to theirs hearts content.  :)  Have a look at the Grasshopper [README][] and [Wiki][] for tutorials and examples of how various REST-ful web applications and services can be built on Grasshopper.

[attribution]: http://net.tutsplus.com/tutorials/ruby/from-codeigniter-to-ruby-on-rails-a-conversion/
[source]: http://github.com/tuxychandru/grasshopper/tree/master/examples/shoutbox/
[git]: http://git-scm.com/
[node.js]: http://nodejs.org/
[npm]: http://npmjs.org/
[Grasshopper]: http://github.com/tuxychandru/grasshopper
[CouchDB]: http://couchdb.apache.org/
[gitInstall]: http://book.git-scm.com/2_installing_git.html
[nodeInstall]: http://nodejs.org/#download
[couchInstall]: http://wiki.apache.org/couchdb/Installation
[node-couchdb]: http://github.com/felixge/node-couchdb
[validation API]: http://wiki.github.com/tuxychandru/grasshopper/validation-api
[Repositories]: http://martinfowler.com/eaaCatalog/repository.html
[PRG]: http://en.wikipedia.org/wiki/Post/Redirect/Get
[design]: grasshopper-shoutbox/design.zip
[README]: http://github.com/tuxychandru/grasshopper#readme
[Wiki]: http://github.com/tuxychandru/grasshopper#readme
