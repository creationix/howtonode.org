Title: Easy Hosting with Spark
Author: Tim Caswell
Date: Thu, 22 Jul 2010 20:44:44 GMT
Node: v0.1.101

This article will go through building a simple RESTful key/value store using [Connect][].  Then I'll explain my favorite way to host apps on [Ubuntu Server][].  This will use [upstart][] and [Spark][].  We'll setup the [node.js][] environment using the super easy [Ivy][] distribution.

## Quick Node Install using the Ivy Distribution

Assuming you have a fresh host with Ubuntu Server 32-bit, we'll get a node environment up and running in a matter of minutes.

The only dependency for Ivy is git, this is easy to get with a single command.

    sudo apt-get install git-core

Now that you have git installed getting ivy is also a one liner:

    wget -O- http://github.com/creationix/ivy/raw/master/utils/setup.sh | sh

This will download Ivy from github and set it up as a portable node environment.  Now you have a fully functional node setup bundled with my favorite set of modules pre-installed.  To install it, simply add the `ivy/bin` folder to your `$PATH` environment variable. Assuming you ran the install script from your home directory, add this line to your `.profile` file to make it automatic on login.

    PATH=$HOME/ivy/bin:$PATH

Test it by launching node and inspecting the require.paths.  My output looks like this:

    tim@TimBook:~$ node
    Type '.help' for options.
    node> require.paths
    [ '/Users/tim/.node_libraries'
    , '/Users/tim/ivy/lib/node'
    ]
    node> 

Notice that the local lib folder within Ivy is already in node's require path.

For developing I like to write apps on my laptop and then push them to my server using git.  I have Ivy installed on my laptop the same as the server.  If you have an OSX or Linux laptop, follow the steps from above (using `curl` instead of `wget` on OSX) to get a matching environment on your laptop.

*NOTE* - The rest of this tutorial doesn't depend on Ivy, it's simply the easiest way to get node + Connect + Spark installed.

## Writing an Application

Ok, now to get some real work done.  In this tutorial we'll make a simple RESTful key/value store.

Let's create a basic app structure.

    mkdir memory_bank
    cd memory_bank
    touch app.js
    touch memory_bank.js
    mkdir public
    touch public/index.html

Now your directory should look like 

    memory_store/
    |-- app.js
    |-- memory_store.js
    `-- public/
        `-- index.html

### Data Store

All data will be kept in memory using a simple object stored in the global closure.

<easy-hosting-with-spark/memory_bank.js#database>

There is nothing magical here, just a plain JavaScript object.

### RESTful Interface

The data will be available from the web via the following RESTful API.

    GET /:key - Retrieve a value based on key.
    PUT /:key - Update or insert a value based on key.
    DELETE /:key - Remove a value by key

To write this app we'll first write the application logic as a `Connect.router()` config.

<easy-hosting-with-spark/memory_bank.js#routes>

Go ahead and read over that program again.  There is lots of fun goodness in there.

### Stack it up with Connect

Now we want to convert this simple collection of route handlers into a full server complete with logging, gzipping, smart caching, and all the other goodies that Connect provides out of the box.  Since we're sending the `Last-Modified` header, we'll even get 304 responses because of the `Connect.conditionalGet()` filter.

<easy-hosting-with-spark/app.js>

Also since this pattern fits a common use case, we added a nice helper `Connect.createApp`.

<easy-hosting-with-spark/app2.js>

It's basically the same thing, just assumes all the layers I explicitly added with `createServer()`.


### Web Interface

It's beyond the scope of this article, but if you wanted a web-based interface to your app, just build it in the `/public` folder.  The server's RESTful API is easily used from a browser.  May I suggest a [couple][] [libraries][] from the sponsors of Connect?

Connect will serve the static files in public for you.  There is no need for Apache or Nginx.  Even if you use those for deployment, this makes development easy.

## Spark it up

If you notice, we never actually call `listen()` on the `Server` object.  We instead export it as the module itself.  The reason for this is so that Spark can externally manage all the binding and spawning for you without any modification to your code at all.

### Local Testing

To test the server on your laptop, simply `cd` into the directory with `app.js` and type `spark`.

    tim@TimBook:~/memory_bank$ spark
    Spark server(42611) listening on http://*:3000 in development mode

You can specify things like what port to bind to and what uid to assume from the spark command.

### Deployment

To deploy this copy it to your linux server.  My favorite way is to push the code to github, and then clone it on the server.  This way you have backup of the code and two-way synchronization.

#### Add a Connect Config File

So assuming it's cloned on your server under the folder `/memory_bank` let's set it up.

    cd memory_bank
    touch config.js

Then using whatever text editor you prefer, put some nice settings in your config. This will be run as root since we're using upstart to launch it, so we can bind to ports like 80, and we should drop uid to someone safe just in case of node security flaws.

<easy-hosting-with-spark/config.js>

#### Add an Upstart Config File

Then go to `/etc/init` and create an upstart config file.  In this file you want to set up the environment for spark to run and tell it to start your server using spark.

<easy-hosting-with-spark/memory_bank.conf>

Save this file at `/etc/init/memory_bank.conf` and set it as executable.  Now you can start your node server using upstart commands.

    sudo start memory_bank

If all went well you should see a message stating it started successfully and give you the pid.  Now hit your server on the port you specified and see your app.  

*NOTE* - If you didn't design a front-end in `/public` you'll just see the blank index.html page.

## Conclusion

I've set up a few sites this way on more than one server and I find it very useful.  I hope this article fits your use case as well, or at least gets you in the right direction.

The software libraries used in this tutorial are very modular.  You can use them in isolation from each other.

If you want to compile node from source instead of use Ivy, go ahead.  If you want to use Spark for a raw tcp server, go ahead, Spark works for *any* `net.Server` or `http.Server` instance as long as it's exported as `app.js`.  Connect even allows for embedding an `http.Server` instance as a last middleware layer.

This is simply my preferred setup and I've made the parts as modular as possible to people can mix and match in ways they want.

[Connect]: http://senchalabs.github.com/connect/
[Ubuntu Server]: http://www.ubuntu.com/server
[upstart]: http://upstart.ubuntu.com/getting-started.html
[Spark]: http://github.com/senchalabs/spark
[node.js]: http://nodejs.org/
[Ivy]: http://github.com/creationix/ivy
[couple]: http://www.sencha.com/products/touch/
[libraries]: http://www.sencha.com/products/js/