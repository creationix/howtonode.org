Title: Twinkle Twinkle Little Meryl
Author: Kadir Pekel
Date: Wed Sep 14 2010 22:26:51 GMT+0200 (CST)
Node: v0.1.102

This article will get you into little world of Meryl, which is a minimalist web framework built on nodejs. With
its small sized code base, it is very simple to use, fun to play and easy to modify. Beyond the other full-stack
web frameworks, Meryl handles some core features and leaves the rest for you. So the goal of Meryl is; while
keeping the core features and extensions powerful, letting user to build owned web applications as flexible as they
could.

## Getting feet wet

First install Meryl. You can either use npm or manual methods for installation.

For npm installation, simply type:

	> npm install meryl

Through various manual installation methods you may choose cloning Meryl project via git under ./node_libraries
directory. Since Meryl has no any dependencies, you are on the way to go:

	> cd .node_libraries
	> git clone "http://github.com/coffeemate/meryl.git"

Yep, it's done. You can now freely use Meryl in your applications. As a startup, please check out our first example
below. Here is what Meryl looks like.

	// app.js 
	
	// import meryl
	var meryl = require('meryl');

	// Now define a request handler tied to an url expression.
	meryl.h('GET /', function () { this.send('<h3>Hello, World!</h3>'); });

	// OK, here we go. Let's plug meryl into your http server instance.
	require('http').createServer(meryl.cgi()).listen(3000);


Later you create a file with an arbitrary name (conventionally 'app.js') with the contents above, run it with node:

	> node app.js

So point your http client to address 'http://localhost:3000/' to see the expected output.

## So What

If you have succeed running Meryl, we're ready to dive deeper. Meryl has some nice features worth mentioning
before we go.

* Robust request handling with regex based but Meryl flavored routing expressions.
* Middleware infrastructure via plugins.
* Flexible simple minded extension system for add-ons.

Yes, this brief of features denotes the fundamental parts of Meryl clearly. It has three main concepts; handlers,
plugins and extensions.
