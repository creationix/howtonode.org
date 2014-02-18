Title: Facebook Connect with Node
Author: Dominiek ter Heide
Date: Thu Mar 18 2010 22:00:00 GMT+0000 (UTC)
Node: v0.1.31

A big part of building a new web application is repurposing common patterns, one such pattern is the ability for users to sign in and out. One way of solving this quickly is by using Facebook Connect. 

## Background

Unlike some APIs, the Facebook API is very Javascript friendly, but unfortunately it can be very time consuming to go through the maze of misdirected Facebook documentation. So in order to make Facebook integration quick and easy, I've wrapped a lot of under-the-hood code into a plugin called [node-facebook][]. This plugin also provides examples and routines to get your Facebook Canvas application running quickly with Node, however, this article will focus on the FB Connect part.

>Facebook's developer tools are increasingly going into the direction of more Javascript on the client-side. I also have a strong preference of offloading certain logic to the client-side. This article will also attempt to follow [that direction][].

## Communication

As you can see in this totally unnecessary diagram, most of the integration takes place on the client-side:

![Awesome Diagram](http://github.com/dominiek/node-facebook/raw/master/doc/communication.png "Awesome Diagram")

## Dependencies

_Note: For this article I've been using NodeJS version 0.1.31 and Express version 0.7.1_

You need to install both [NodeJS][] and the [Express Web Framework][]. Assuming you've installed NodeJS, you can easily include express into your Git project by adding a submodule:

    mkdir -p lib/support
    git submodule add git://github.com/visionmedia/express.git lib/support/express
    cd lib/support/express
    git submodule init
    git submodule update
    
Second, you need to include [Hashlib][] into your project and compile it. Hashlib is a library that provides cryptographic routines like MD5:

    git submodule add git://github.com/brainfucker/hashlib.git lib/support/hashlib
    cd lib/support/hashlib
    make

## 1. Registering your Facebook Application

In order to use Facebook Connect, you need to [register a new Facebook application] and set the FB Connect URL to the root of your application:

![Setting your FB Connect URL](http://github.com/dominiek/node-facebook/raw/master/doc/register_application.png "Setting your FB Connect URL")


## 2. Setting up your Project

For Facebook integration you need to place these three files into your project folder:

1. [facebook.js][] - plugin for the Express framework - to be placed in /lib
2. [jquery.facebook.js][] - a simple jQuery plugin to interface with the [Facebook JS library][] - to be placed in /public/javascripts
3. [xd_receiver.htm][] - used by Facebook for opening up a [Cross-domain Communication Channel][] - to be placed in /public

After adding the dependencies and placing these files, your directory structure should look like this:

    myproject
    |-- app.js /* new file */
    |-- lib
    |   |-- support
    |   |   |-- express
    |   |   `-- hashlib
    |   |-- facebook.js
    `-- public
        |-- index.html /* new file */
        |-- xd_receiver.htm
        `-- javascript
            `-- jquery.facebook.js

To make our application work, we only need to implement two files: index.html and app.js. That's right, we're only using AJAX calls and static files.

## 3. In the Browser

The provided jQuery plugin provides the following functions that we'll be using:

* **fbInit** - initialize the JS lib and set up the cross-communication channel
* **fbConnect** - invoke the connect procedure and to synchronize sessions and profile information with our backend
* **fbLogout** - logout from both the Facebook Application and our NodeJS application
* **fbIsAuthenticated** - check whether a user is logged in or not

First we start out with a simple skeleton that loads jQuery and the Facebook JS library. Please note that you need the div named *fb-root* right after the body tag for Facebook's lib to work:

    <html>
     <head> 
        <script type="text/javascript" src="http://ajax.googleapis.com/ajax/libs/jquery/1.3.2/jquery.min.js"></script>
        <script type="text/javascript" src="/javascripts/jquery.facebook.js"></script>
      </head>

      <body>
        <div id="fb-root"></div>
        <script type="text/javascript" src="http://static.ak.connect.facebook.com/js/api_lib/v0.4/FeatureLoader.js.php"></script>

      </body> 
    </html>
  
Now let's implement a basic UI:

<facebook-connect/index.html>

## 4. On the Server

The [Express][] plugin is initialized like any other plugin in the environment configuration routine, but takes your Facebook API key and Secret as mandatory initialization arguments:

    use(require('facebook').Facebook, {
      apiKey: 'FACEBOOK_API_KEY', 
      apiSecret: 'FACEBOOK_API_SECRET'
    })

Next we need to implement 3 AJAX actions to make jquery.facebook.js work:

* **GET /fbSession** - Is the current user logged in? Or is there a cookie/param present I can use to authenticate?
* **POST /fbSession** - Update additional information about the user (name, picture, etc)
* **POST /fbLogout** - Called after logout from the Facebook Application took place

Here is an example Express application that uses no persistent storage:

<facebook-connect/app.js>

>The verification of Facebook data by the server-side is done by using the Application Secret and the signature that's sent along with the data. First, all parameters and cookies are put together in one string and then the Application Secret is appended to it. The MD5 hash of this string should match the signature that's included. [more about verifying the signature][]
    
In any subsequently added action, you can access the Facebook Session simply like this:

    get('/hello', function () {
      var fbSession = this.fbSession()
      return 'Hello ' + ' user ' + fbSession.userId + '!';
    })

## 6. Further Development

In this article we went into the direction of putting a lot of UI flow and controller logic into the browser. This can be quite counter-intuitive. As a Rails-programmer and former RJS lover, I can attest to that. However, while there are still remaining issues like SEO and accessibility, this approach allows the server to really focus on data modelling/routing and has numerous scaling benefits.

All examples in this article and more can be found on the [node-facebook repository][] I created. If you run into any obstacles, feel free to [contact me][] or fork the code. I hope to soon write a similar plugin for Twitter's OAUTH based login.

## Appendix A: Facebook Troubleshooting Checklist

Debugging Facebook Application problems can be a real pain in the neck, here is a simple checklist distilled from many frustrating mind-cycles:

* Are you sure xd_receiver.htm is in place and being accessed?
* Are you sure the <div id="root"></div> element is present in the body?
* If you are using Safari with iFrames, there are some [cookie hacks][] you need to do
* Are cookies being set successfully after FB connect?
* Are you sure you're using the correct API keys?

[NodeJS]: http://nodejs.org
[Express]: http://github.com/visionmedia/express
[Express Web Framework]: http://github.com/visionmedia/express
[that direction]: http://synaptify.com/?p=613702
[node-facebook]: http://github.com/dominiek/node-facebook
[Hashlib]: http://github.com/brainfucker/hashlib
[register a new Facebook application]: http://facebook.com/developer
[Facebook JS library]: http://wiki.developers.facebook.com/index.php/JavaScript_Client_Library
[facebook.js]: http://github.com/dominiek/node-facebook/raw/master/lib/facebook.js
[jquery.facebook.js]: http://github.com/dominiek/node-facebook/raw/master/lib/jquery.facebook.js
[xd_receiver.htm]: http://github.com/dominiek/node-facebook/raw/master/examples/fb_iframe/public/xd_receiver.htm
[Cross-domain Communication Channel]: http://wiki.developers.facebook.com/index.php/Cross_Domain_Communication_Channel
[cookie hacks]: http://saizai.livejournal.com/897522.html
[more about verifying the signature]: http://wiki.developers.facebook.com/index.php/Verifying_The_Signature
[node-facebook repository]: http://github.com/dominiek/node-facebook
[contact me]: http://dominiek.com/
