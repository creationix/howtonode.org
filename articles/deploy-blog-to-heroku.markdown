Title: Node.js For Beginners. Deploy Your Blog to Heroku
Author: Lenny Witman
Date: Fri Apr 17 2015 12:53:35 GMT+02:00 (EET)
Node: v0.12.2
Error pages are not what typically appear on your screen when you're surfing the web, but when it happens it's so annoying! To see how servers work from within, we will build a simple web server by ourselves. We will use Node.js as a server part technology for that task. Then we'll use Heroku cloud application platform to turn this local server into a world wide server.

##Why should I?
Hi, everyone! Don't know how about you, but my weekend was great!

Friday evening. I came home from work, fed my cat, grabbed some pizza, and wanted to have some fun. What could be funnier than good old movies? Nothing, right? So, I went to "IMDB Top 500" to choose one. Then this happened:

![IMDB is down](http://i.imgur.com/ItxlQvm.png "IMDB is down")

 And I had to choose my evening movie randomly. It was "Sharknado". Should I say that my Friday was ruined?

To be honest, this is not what typically happens when you are surfing the web. But when it does... Man, it's so annoying! It's annoying, but we're curious, aren't we? And, for our curiosity to be satisfied, we will build a simple web server by ourselves. It will help us to see how it works (or how it won’t work) from within.

--------------------

##How can I?
We will use [Node.js](http://nodejs.org/ "Node.js home page") for our project. Node.js is an open source, cross-platform runtime environment, which allows you to build server-side and networking applications. It's written in JavaScript and can be run within the Node.js runtime on any platform. First of all, of course, you need to install it. You'd better check the [download page](http://nodejs.org/download/ "Node.js download page") for more details. I'll wait until you finish, so don't worry. Is it done? Great! Now you can create your first web server. And it will be one of the easiest tasks in your life.
###Pretty simple, but it's a server!
First of all, we need to create a JavaScript file. Let's name it server.js:

<deploy-blog-to-heroku/server.js>

It's simple. It's tiny. But it's a server! Let's make sure it's working. Run at your terminal:

    node server.js

Then check it in your browser. Your new server's address, as you may guess, is http://localhost:3000/
Mine is working. How about yours? Hope, it's working too.

![localhost server](http://i.imgur.com/idykoj7.png "Local server running")

Now, to be sure it's a web server and not just a piece of code that returns a single line of text, we'll use it as a server! You can check it with your smartphone. Let's suppose, your laptop's IP address within your local network is  192.168.1.101. You can connect to your server through the 3000th port (for this particular example) by typing http://192.168.1.101:3000/ in your browser. Works well in my case:

![Server via smartphone](http://i.imgur.com/emlOrX0.png "Accesing server via smartphone")

Well, it is a server! And we have evidence. What you got here is your own client-server model, which can fit in your bag! Take it any place you want! It will be a good idea to deploy our server online, so everyone could see it. 

But you should notice something, before we go further. Let's look more closely at our first Node server. This is an example of how Node provides you with non-blocking and event-driven behavior. Let me explain:

    $.post('/some_requested_resource', function(data) {
      console.log(data);
    });

This code performs a request for some resource. When the response comes back, an anonymous function is called. It contains the argument  ```data```, which is the data received from that request.

So, Node allows you to use the so-called event loop, which works faster because of non-blocking behavior. For example, [nginx](http://nginx.org/ "ngnix home page") uses an event loop with asynchronous I/O. That's why it's fast as hell!

This is not so hard to understand this conception in outline, so let's move along.
###Make it worldwide
Works fine. But it works locally. WWW is for "World Wide Web" and we will turn your local server into a world wide server. We'll use [Heroku](https://www.heroku.com "Heroku") cloud application platform for this. Heroku is a cloud platform as a service (cool long-bearded programmer guys call such type of things "PaaS"). It allows you to deploy your web server, so everyone could see how awesome you are as a web developer. First of all, you need to create an account on developer's site and install Heroku. This is not so hard. Just follow the instructions. There is also instruction on Heroku's site that can explain you how to run your first simple web server, which returns you the "Hello, World!" string. You can try it, but I think that it will be more interesting if we build our own web server from scratch. Sounds exciting, huh?
###Look, mom! I'm developing!
First step after Heroku installation is to log in to the system from your computer:

    heroku login

We will leave Heroku for now. But we'll need it soon after we build our server. 

Now, the creation. It will be a simple blog with basic functionality. It will show you requested web pages and the error page in case of an error.

Create your project directory. And then create the ```server.js``` file inside of it.

First of all, let's declare some variables:

    var http = require("http");
    var fs = require("fs");
    var path = require("path");
    var mime = require("mime");

The first one will give you the key to Node's HTTP functionality.  The second one is for possibility to interact with the file system. The third one allows you to handle file paths. The last one allows you to determine a file's MIME-type. And it's not a part of Node.js, so we need to install third-party dependencies before using it. We need to create the ```package.json``` file for that purpose. It will contain project related information, such as name, version, description, and so on. For our project we will use MIME-types recognition, because it's not enough to just send the contents of a file when you use HTTP. You also need to set the ```Content-Type``` header with proper MIME-type. That's why we need this plug-in. 

Create the ```package.json``` file  and fill it with proper information. Here's mine:

<deploy-blog-to-heroku/package.json>

There are "name", "version", "description", and "dependencies" fields in it. The syntax is simple, as you can see. We added our "mime" plug-in and now it's time to download it. We'll use built-in Node Package Manager. Just run:

    npm install

It will create ```node_modules``` folder and place all the files inside of it. So, we resolve our dependencies and can return to our code. 

We will now create ```send404()``` function. It will handle the sending of 404 error, which usually appears when requested file doesn't exist:

    function send404(response) {
      response.writeHead(404, {"Content-type" : "text/plain"});
      response.write("Error 404: resource not found");
      response.end();
    }

Nothing sophisticated with this one. It returns plain text when server can't find a page.
 
 Now we will define ```sendPage()``` function. It first writes the header and then sends the contents of the file:

    function sendPage(response, filePath, fileContents) {
      response.writeHead(200, {"Content-type" : mime.lookup(path.basename(filePath))});
      response.end(fileContents);
    }

Notice the way we handle the MIME-types. 

Now we'll define how our server will handle responses. This function will return the content of the requested file or the 404 error otherwise: 

<deploy-blog-to-heroku/handler.js>

And now it's time to create the HTTP server:

<deploy-blog-to-heroku/create-server.js>

Now we need to start our server. And here's the tricky part. Do you remember how we told the server to listen to the 3000th port in our first example? No? I'll remind you:

    http.createServer(<some code here>).listen(3000)

We can do it when we run our server locally. But Heroku sets a dynamically assigned port number to your app. That's why we need to handle all this mess with ports as it’s shown below:

    var port_number = server.listen(process.env.PORT || 3000);

You can use the ```port_number``` variable later. For example, in ```console.log()``` function to tell the user, which port is used. This is your homework for tomorrow.

That's all we need to run our simple web server. Now it's time to create some content. We'll create the ```public``` folder and two folders inside of it: ```stylesheets``` and ```images```. We'll put all our HTML files into the ```public``` folder.The  ```stylesheets``` folder is for CSS files. And the ```images``` one is for pictures.

We need to create the ```index.html``` file. It will determine our blog's exterior. Here's the code:

<deploy-blog-to-heroku/index.html>
   
Here you can see how the main page looks like:

![My simple blog](http://i.imgur.com/3pSODQH.png "My simple blog")

You are free to create your own CSS file if you don't like our design.

What we are interested in for now is how our server handles the 404 error. That's why we created two "Read more" links. The first one is connected with the actual HTML file within the ```public``` folder. The second one is broken. Let's test how it works.

To start your server locally run:

    node server.js

And then click the first link:

![It works](http://i.imgur.com/6Z9OxuV.png "It works")

Then return to the main page and check the second one:

![enter image description here](http://i.imgur.com/iQBQKdM.png "It's broken")

Here's our 404 page.

We tested our simple server locally and now is time to deploy it.
###It's Heroku time!
Open your terminal within your project folder. For my Linux it's:

    cd /path/to/my/project

 Then run:

    git init

Empty Git repository will be initialized in .git/ folder.

Then run:

    git add .

This command allows Git to track your files changes. 

Now commit your files to the initialized Git repo:

    git commit -m "Simple server functionality added"

 We'll create our first Heroku application now:

    heroku create

Heroku will generate a random name for your application. In my case it's enigmatic-citadel-9298. Don't worry. You can change it later.

Now we can deploy our project. Every Heroku app starts with no branches and no code.  So, the first time we deploy our project, we need to specify a remote branch to push to:


    git push heroku master

The application is now deployed. Ensure that at least one instance of the app is running:


    heroku ps:scale web=1

And now, before we open it, it's time to choose a proper name for our first creation. I called it ```myfirstserver```:


    heroku apps:rename myfirstserver

Everything is done. You can try it now:


    heroku open

This command will open your Heroku project in your web browser. In this particular case, server address is https://myfirstserver.herokuapp.com/. Now you can share your first web application with any person you want.
##Looking back
We've built our own web server using less than 50 lines of code. Not so hard, if you ask me. It's pretty simple, yes. But you can see, how average server works. It was a simple task. But you can combine Node.js with different technologies, such as CSS3 and HTML5, then spice it with some JavaScript functionality. There is really a lot of [libraries and frameworks](http://en.wikipedia.org/wiki/List_of_JavaScript_libraries) to take a look at.
Personally I started to dig into Webix, it's a relatively new library and is developed by a small software company from Eastern Europe. Samples of apps made with the library and Node.js: [CRM](http://xbsoftware.com/products/webix-crm) and [task planner](http://xbsoftware.com/products/ganttpro/). Seems like you can create anything with the right client-side framework and Node.js.


And, talking about Node.js as a technology...
###...it will make your DIRTy job for you.
There is an acronym created to describe such type of applications Node.js was created for. It's DIRT. It means Data-Intensive Real-Time applications. Node allows a server to handle a lot of connections and work with a number of requests at the same time. And you don't need much memory for that. It's designed to be responsive and fast. Just like your web browser! So, it's useful when you need to create an application that will be able to respond instantly to a large number of users. And Node was built from scratch to provide you with such a functionality.

Well, that's enough for today. Hope you liked it. See ya!
