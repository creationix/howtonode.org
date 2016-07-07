/**
 * This example demonstrates how to setup an express server with a connetion to a Mongo DB to work with the CloudRail services that use OAuth
 * It uses "login with" Instagram as an example
 * For brevity, it does insufficient error checking and should thus not be used in production unmodified
 */
"use strict";
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

const Instagram = require("cloudrail-si").services.Instagram;

const INSTAGRAM_CLIENT_ID = "xxx"; // Replace with a valid client id
const INSTAGRAM_CLIENT_SECRET = "xxx"; // Replace with a valid client secret
const PORT = 12345;
const AUTH_ENDPOINT = "/auth";
const REDIRECT_URI = "http://localhost:" + PORT + AUTH_ENDPOINT;

// Someone navigated to the main path
app.get("/", (req, res) => {
    // Create a new unique identifier
    let loginId = new ObjectId();

    // Instantiate Instagram (this could also be Facebook, Google Plus, ...)
    // Provide a function that specifies where the user sees Instagram's authorization page, will be called by the instance during login
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
        // Make sure we don't cause trouble in case the callback is called more than once
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