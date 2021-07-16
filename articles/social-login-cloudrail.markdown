Title: Social Login with Twitter, Facebook, GitHub & More using CloudRail SI
Author: Florian Wendel
Date: Wed Jul 06 2016 12:00:00 GMT+0200 (CEST)
Node: v6.2.1

CloudRail Single Interface (SI) is a collection of SDKs for mulitple platforms (including NodeJS) that makes it easy for developers to connect to cloud APIs of all kinds.
It's kept up to date with the most recent versions of those APIs so the developer doesn't need to worry about API changes (e.g. Dropbox who have deprecated their v1 API just a few days before this article was written).

## Goal of this Article

We will set up a simple Express server with a MongoDB connected and use CloudRail SI to provide social login with Facebook, GitHub, Google Plus, LinkedIn, Slack, Twitter, Windows Live, Yahoo or Instagram. For the sake of brevity I do not handle errors so don't use this code in production unless you add error handling.

## Let's get set up

Make sure you have a recent version of NodeJS installed (>4.0.0) and a MongoDB running (in this example we connect to one running on localhost).

Create a new NodeJS project and add Express, Mongoose and CloudRail SI as dependencies:

	npm install --save express
	npm install --save mongoose
	npm install --save cloudrail-si

## Let's start coding

After, we create and start filling our app.js file:

	const crypto = require("crypto");
	const express = require("express");
	const app = express();
	const mongoose = require("mongoose");
	const ObjectId = mongoose.Types.ObjectId;
	const Schema = mongoose.Schema;
	const LoginSession = mongoose.model("LoginSession", new Schema({authState: String}));
	const User = mongoose.model("User", new Schema({userId: String, credentials: String, token: String}));

	const MONGO_ADDRESS = "mongodb://localhost:27017/test-db";

	mongoose.connect(MONGO_ADDRESS);

As you can see, we've defined two schemas, one for login sessions and another for users. The latter is purely exemplary and can of course be enriched with more information about the user. We then connect to the database.

Now, let's import the service we want to use for social login. We are using Instagram as an example but it could also be any of the other eight services mentioned above!

	const Instagram = require("cloudrail-si").services.Instagram;

We provide the required credentials for the respective service. The [CloudRail documentation](https://github.com/CloudRail/cloudrail-si-node-sdk/wiki/) has instructions on how to get those credentials for the service of your choice.

	const INSTAGRAM_CLIENT_ID = "xxx"; // Replace with a valid client id
	const INSTAGRAM_CLIENT_SECRET = "xxx"; // Replace with a valid client secret
	const PORT = 12345;
	const AUTH_ENDPOINT = "/auth";
	const REDIRECT_URI = "http://localhost:" + PORT + AUTH_ENDPOINT;

We've also defined which port our server will be listening on and at which path authentication redirects will be received. This is information we have to communicate to the respective service so we define it here.

Next, we define our first server endpoint. It checks whether the user is logged in (has a token in the request query) and if that is not the case starts the login process. If on the other hand the user is already logged in, it queries and returns the name the user uses in the social network they've signed up with:

	// Someone navigated to the main path
	app.get("/", (req, res) => {
	    // Create a new unique identifier
	    let loginId = new ObjectId();

	    // Instantiate Instagram (this could also be Facebook, Google Plus, ...)
	    // Provide a function that specifies where the user sees Instagram's authorization page. Will be called by the instance during login
	    let profile = new Instagram((url, state, cb) => {

	        // Save the internal state of the Instagram instance in the DB
	        let loginSession = new LoginSession({_id: loginId, authState: state});

	        // Then redirect to the authorization page, do not call the callback so login stops
	        loginSession.save(err => res.redirect(url));

	        // Provide credentials, a redirect pointing to where we want to continue login and the unique identifier    
	    }, INSTAGRAM_CLIENT_ID, INSTAGRAM_CLIENT_SECRET, REDIRECT_URI, loginId.toString());

	    // Extract "token" from the query
	    let token = req.query["token"];

	    // If "token" was found, load the saved credentials so login will be a noop (unless the credentials are expired)
	    if (token) {
	        User.findOne({token: token}, (err, user) => {
	            profile.loadAsString(user.credentials);
	            logInAndReturnName();
	        });
	        // Else go on without loading    
	    } else {
	        logInAndReturnName();
	    }

	    // Login and when successful get the full name and respond with some simple text
	    function logInAndReturnName() {
	        profile.login(err => {
	            profile.getFullName((err, name) => {
	                res.send("Hello, " + name);
	            });
	        });
	    }
	});

Now we need to add an endpoint which handles authentication redirects and start the server:

	// A login process was triggered and the user has granted access. Instagram will then callback this endpoint.
	app.get(AUTH_ENDPOINT, (req, res) => {
	    // Extract the unique identifier for this login from the query
	    let loginId = req.query["state"];

	    // Instantiate Instagram again
	    let profile = new Instagram((url, state, cb) => {

	        // This time the function just calls the callback with the incoming url
	        cb("http://localhost:" + PORT + req.url);

	        // We can leave state undefined, it is not used anymore
	    }, INSTAGRAM_CLIENT_ID, INSTAGRAM_CLIENT_SECRET, REDIRECT_URI, undefined);

	    // Retrieve the LoginSession with the Instagram state we have saved before
	    LoginSession.findByIdAndRemove(loginId, (err, loginSession) => {
	        // Make sure that no problems happen, in case the callback is called more than once
	        if (!loginSession) return;

	        // Resume the login with this state
	        profile.resumeLogin(loginSession.authState, err => {

	            // Retrieve the user's unique identifier
	            profile.getIdentifier((err, userId) => {

	                // Look for the user in the DB to find a potentially existing account
	                User.findOne({userId: userId}, (err, user) => {

	                    // Create a cryptographically strong token for the user to identify themselves with in future requests
	                    let token = crypto.randomBytes(16).toString("hex");

	                    // If the user has no account, create a new one
	                    if (!user) {
	                        user = new User({userId: userId, credentials: profile.saveAsString(), token: token});
	                        // If the user has an account already, refresh the credentials
	                    } else {
	                        user.credentials = profile.saveAsString();
	                    }

	                    // Save the user and redirect to the starting page, this time with a token in the query
	                    return user.save(err => {
	                        res.redirect("/" + "?token=" + user.token);
	                    });
	                });
	            });
	        });
	    });
	});

	app.listen(12345);

This is it, we've successfully set up a server that allows users to create accounts with a social network. If you want to learn more about CloudRail SI, just check out the [Website](https://cloudrail.com).
You can use this code as a starting point for your own integration or play around with it and improve it. Good first steps could be to implement actual error checking and getting out of callback hell with Promises.

The full code of the finished app.js is below:

<social-login-cloudrail/app.js>