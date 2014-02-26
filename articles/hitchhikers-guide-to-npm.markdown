Title: Hitchhikers guide to npm
Author: Hemanth.HM
Date: Sat Jun 23 2012 06:11:00 GMT
Node: v0.6.8

__Hello hackers, this post is just a simple hello-world packing tutorial for packing nodejs with npm.__

P.S : This does not talk about how npm works in depth, but gets one started with npm and assumption is you have dealt with some nodejs and npm installs before!

First up, if you have not installed node.js and npm (which is bundled with latest version) please do [so](https://github.com/joyent/node/wiki/Building-and-installing-Node.js


__The below are the steps for packing and publishing packages to npm registry :__

    mkdir hello-node

    cd hello-node/

    npm adduser hemanth

    Username: hemanth
    Password: 
    Email: hemanth.hm@gmail.com
    npm http PUT https://registry.npmjs.org/-/user/org.couchdb.user:hemanth
    npm http 409 https://registry.npmjs.org/-/user/org.couchdb.user:hemanth
    npm http GET https://registry.npmjs.org/-/user/org.couchdb.user:hemanth
    npm http 200 https://registry.npmjs.org/-/user/org.couchdb.user:hemanth
    npm http PUT https://registry.npmjs.org/-/user/org.couchdb.user:hemanth/-rev/3

    npm init
   
    Package name: (hello) 
    Description: Hello World example for nodejs
    Package version: (0.0.0) 
    Project homepage: (none) https://www.github.com/hemanth/hello-node
    Project git repository: (none) https://www.github.com/hemanth/hello-node.git
    Author name: Hemanth.HM
    Author email: (none) hemanth.hm@gmail.com
    Author url: (none) h3manth.com
    Main module/entry point: (none) hello.js
    Test command: (none) 
    About to write to /home/hemanth/lab/hello-node/package.json

    {
    "author": "Hemanth.HM <hemanth.hm@gmail.com> (h3manth.com)",
    "name": "hello",
    "description": "Hello World example for nodejs",
    "version": "0.0.0",
    "homepage": "https://www.github.com/hemanth/hello-node",
    "repository": {
        "url": "https://www.github.com/hemanth/hello-node.git"
    },
    "main": "hello.js",
    "dependencies": {},
    "devDependencies": {},
    "optionalDependencies": {},
    "engines": {
     "node": "*"
    }
    }



    Is this ok? (yes) yes

     ls
     package.json

    cat > hello.js
    var world = function() {return "Hello World"; }  
    exports.world = world

    node
    > require('./hello.js')
    { world: [Function] }

    > hello = require('./hello.js')
    { world: [Function] }

    > hello.world
    [Function]

    > hello.world()
    'Hello World'

    npm publish 


That's it! ``` npm unpublish ``` to remove your package from the registry. 

__Summarizing the steps:__


* mkdir <your_package>

* cd <your_package>

* npm adduser 

* npm init 

* npm publish

__A bit of digging into npm -- node package manager:__

> npm  is  the package manager for the Node JavaScript platform.  It puts
       modules in place so that node can find  them,  and  manages  dependency
       conflicts intelligently.

**npm-init**     -> Interactively create a package.json file. Make sure that you provide the Main module/entry point.

**npm-adduser**  -> Adds a registry user account.

**npm-publish**  -> Publish a package  to  the  registry so that it can be installed by name.

**npm-unpublih** -> To remove the package from the registry.

         
__Adding dependencies:__

After ```npm init``` a package.json file will be created in your package directory, open it and look for the 
dependencies attribute and added the needed dependencies like below :

    "dependencies": {
        "request"      :  ">= 1.2.0",
        "xkcd-imgs" :  ">=1.0.0"
     }


P.S : The most common mistake would be forgetting the ```exports``` statement ;)

I think this is enough for a starting up, so far was a Hitchhikers guide to npm, do let me know if something more can be added for one to just get started with npm!

