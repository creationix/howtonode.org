Title: Deploying Node Apps with Spark
Author: Tim Caswell
Date: Thu, 22 Jul 2010 20:44:44 GMT
Node: v0.1.102

This article will go through building a simple RESTful key/value store using [Connect][].  Then I'll explain my favorite way to host apps on [Ubuntu Server][].  This will use [upstart][] and [Spark][].  We'll setup the [node.js][] environment using the super easy [Ivy][] distribution.

## Quick Node Install using the Ivy Distribution

Ivy is a my simple node distribution.  It contains pre-built node binaries and several node modules bundled with it.

### On the Server

Assuming you have a fresh host with Ubuntu Server 32bit, we'll get a node environment up and running in a matter of minutes.  Just install git and run the Ivy installer in your home directory.

    sudo apt-get install git-core
    wget -O- http://github.com/creationix/ivy/raw/master/utils/setup.sh | sh

Now for this to work correctly Ivy's `bin` folder needs to be in your `$PATH`.  Add a line to your `.profile` file to make it automatic on login.

    PATH=$HOME/ivy/bin:$PATH
    
Then source your `.profile` file to get the new settings.

    . .profile

Test it by launching node and inspecting the `require.paths`.  Make sure ivy's lib folder is in there.:

    tim@TimBook:~$ node
    Type '.help' for options.
    node> require.paths
    [ '/Users/tim/.node_libraries'
    , '/Users/tim/ivy/lib/node'
    ]
    node>

### On your Development Machine

For developing I like to write apps on my laptop and then push them to my server using git.  The steps are the same here with the exception that OSX has `curl` instead of `wget`.

    curl -# http://github.com/creationix/ivy/raw/master/utils/setup.sh | sh

## Writing an Application

Ok, now to get some real work done.  In this tutorial we'll make a simple RESTful key/value store.

First create a basic app structure like this.

    memory_bank/
    |-- app.js
    |-- memory_bank.js
    `-- public/
        `-- index.html

### Stack it up with Connect

Connect makes it easy to build fully features HTTP servers complete with logging, gzipping, smart caching, and all the other goodies that Connect provides out of the box.

<deploying-node-with-spark/app.js>

That's it, one line!

### RESTful Interface

Now lets build the `memory_bank.js` file mentioned in the Connect setup.

This app will provide the following RESTful interface.

    GET /:key - Retrieve a value based on key.
    PUT /:key - Update or insert a value based on key.
    DELETE /:key - Remove a value by key

Here we'll write these three request handlers. Since we set the `Last-Modified` header, we'll even get 304 response support through the Connect stack.

<deploying-node-with-spark/memory_bank.js#routes>

See the actual file for the definition of `data` and `sendItem`.

### Web Interface

Connect will serve the static files in the `public` for you.  There is no need for Apache or Nginx.  Even if you use those for deployment, this makes development easy.

## Launching the App with Spark

To test the server on your laptop, simply `cd` into the directory with `app.js` and type `spark`.  Type `spark -h` for options.

    tim@TimBook:~/memory_bank$ spark
    Spark server(42611) listening on http://*:3000 in development mode

### Deployment

To deploy this, copy it to your linux server.  My favorite way is to push the code to github, and then clone it on the server.  This way you have backup of the code and two-way synchronization.

#### Add a Connect Config File

I like to specify a config file instead of using command-line args in the `spark` command. Create a `config.js` file like this:

<deploying-node-with-spark/config.js>

You don't want this config file on your development environment.  The easiest way is to create a `.gitignore` file and remove `config.js` from version control.

#### Add an Upstart Config File

Then go to `/etc/init` and create an upstart config file.  In this file you want to set up the environment for spark to run and tell it to start your server using spark.

<deploying-node-with-spark/memory_bank.conf>

Save this file at `/etc/init/memory_bank.conf` and set it as executable.  Now you can start your node server using upstart commands.

    sudo start memory_bank

If all went well you should see a message stating it started successfully and give you the pid.  Now hit your server on the port you specified and see your app.

*NOTE* - If you didn't design a front-end in `/public` you'll just see the blank index.html page.

## Conclusion

Ivy, Spark, and Connect are a powerful combination that has worked great for me.  They are also useful on their own.

If you want to use Spark for a raw tcp server, go ahead, Spark works for *any* `net.Server` or `http.Server` instance as long as it's exported as `app.js`.  Connect even allows for embedding an `http.Server` instance as a last middleware layer.

I've set up a few sites this way on more than one server and I find it very useful.  I hope this article fits your use case as well, or at least gets you in the right direction.

[Connect]: http://senchalabs.github.com/connect/
[Ubuntu Server]: http://www.ubuntu.com/server
[upstart]: http://upstart.ubuntu.com/getting-started.html
[Spark]: http://github.com/senchalabs/spark
[node.js]: http://nodejs.org/
[Ivy]: http://github.com/creationix/ivy
