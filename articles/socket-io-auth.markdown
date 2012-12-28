Title: Session-based Authorization with Socket.IO
Author: Shahar Kedar
Date: Thu Dec 12 2012 17:44:00 GMT+0200
Node: v0.8.15

## Prolog

I decided to write this article after getting a bit frustrated from searching the Internet for a decent example on how to use session based authorization with socket.io. To be honest, socket.io wiki page on [authorization](https://github.com/LearnBoost/socket.io/wiki/Authorizing) was quite simple to follow and understand, but when it came to **session based** authorization, I got a bit lost (especially considering the fact that it's my third day using Node...). 

## Reading Suggestions

Before reading this article, I strongly suggest you get familiar with Express and Socket.IO. I kept things as simple and minimal as possible, so you really don't need more than a couple of hours to learn what needs to be learned if you're a complete newbie.

I also suggest reading the Authorization wiki page referenced in the prolog.


## Global Authorization vs Namespace Authorization

First I would like to distinguish between two authorization scopes that are currently supported by socket.io, namely - Global and Namespace. *Global* authorization will be used to authorize any attempt to open a (socket.io) connection against our Node application. *Namespace* authorization, on the other hand, allows you to use different authorization rules when accepting connections to a specific socket.io namespace (more on namespaces can be found [here](http://socket.io/#how-to-use))

In this article I will exemplify only how to enable Global authorization, although from the looks of things, namespace authorization is quite straightforward once you understand global authorization.

## A Few Words about Timing

It's important to understand that the authorization process takes place during handshake. This means that, prior to authorization, no socket connection is established. As a matter of fact, because the handshakes in socket.io are implemented as HTTP calls, one can use the HTTP context to get relevant information on the user who's trying to connect. As you'll see next, I will be using cookie data to authorize any user that tried to establish a socket connection to the server.

## Session-based Authorization

As I said, I will be using cookie data to authorize our John Dow. Specifically, I will be using the user's session id to make sure that indeed this user went through the system. The trick here is to use Express' session middleware to assign a **signed** session id to the user, so the next time he sends a request (in our case that would be during socket.io handshake) it will be possible to ascertain that this user is a valid user and not a scoundrel. Theoretically, I could also fetch more information about the user using his session id, but I felt that it's out of scope for this article. I admit that this kind of authorization method is naive, but it's good enough to get you started.

## Time to Code!

I believe I said more than enough on the subject at hand, and now would be the right time to start looking at code. The complete [source code](/socket-io-auth/server.js) takes less then 70 lines (including elaborate comments) and should be enough for anyone with some experience with Express and Socket.IO. Nonetheless I will guide you through the code so there are no complaints.

## Client side: index.html

We begin by creating an HTML file called (surprisingly) index.html:

<socket-io-auth/index.html>

As you can see, our client side is nothing more then several lines of javascript establishing a socket.io connection with our local server. Once connection is established, you will be able to see time slipping away between your fingertips (millisecond ticks) inside your browser console. 

Notice that I'm also listening to the *error* event, in case the connection cannot be established, or access is denied by the authorization process.

## Configuring Express

Now let's create and configure Express:

<socket-io-auth/express-snippet.js>

Pay special notice to the the fact that we're using the session middleware that ships with Express to support sessions. This middleware is responsible for generating session ids for new users when they first login to the system.

The session middleware uses a *secret* value to sign the session id. We will use this mechanism to our advantage when we try to authorize an incoming socket.io connection.

The lines following the Express configuration code are responsible for serving our precious index.html when a user connects to the server.

The last two lines construct an HTTP server over the Express application, and binding it port 3000. Feel free to run <code>node server.js</code> and open your browser at [http://localhost:3000](http://localhost:3000). You should be seeing a single line saying: *Open the browser console to see tick-tocks!*

## Configuring Socket.IO

Next we need to configure socket.io:

<socket-io-auth/socket-io-snippet.js>

Now we're getting to the tricky part. First we need to bind socket.io to our HTTP server. That would be the first line of code - piece of cake.

The next block is the reason we're all here - by calling <code>io.set('authorization', function (handshakeData, accept)</code> we instruct socket.io to run our authorization code when performing a handshake.

The logic goes as follows: first we check if there's a cookie associated with the handshake request. In case the user already logged into our system there should be a cookie containing his session id. If no cookie is found the user is rejected.

If a cookie is found, we try to parse it. The crucial line here is <code>connect.utils.parseSignedCookie(handshakeData.cookie['express.sid'], 'secret')</code>, which tries to unsign the session id cookie value using the same secret key used for signing. If the cookie was indeed signed by our server than the reverse operation should give us the real session id. This is actually our way of making sure that the user trying to connect is someone we "know" and not some fake user trying to hack into our system. Notice that in case we did not succeed in unsigning the value, the return value should equal to the original value, indicating a problem.

The next couple of lines in the full source code are standard socket.io and I won't go into details explaining them.

## Epilogue

That's it! You're ready to implement whatever authorization algorithm you want. Enjoy socket.io!