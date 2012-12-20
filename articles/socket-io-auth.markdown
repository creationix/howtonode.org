Title: Global Authorization in Socket.IO
Author: Shahar Kedar
Date: Thu Dec 12 2012 17:44:00 GMT+0200
Node: v0.8.15

## Prolog

I decided to write this article after getting a bit frustrated of the fact that I couldn't find a single descent example on how to use session based authorization in socket.io. To be honest, socket.io Wiki page on [authorization](https://github.com/LearnBoost/socket.io/wiki/Authorizing) was quite simple to follow and understand, but when it came to session based authorization, I got a bit lost (especially considerting the fact that it's my third day using Node...).


## Global Authorization vs Namespace Authorization

First I would like to distinguish between two authorization scopes that are currently supported by socket.io, namely - Global and Namespace. *Global* authorization will be used to authorize any attempt to open a (socket.io) connection with out server. *Namespace* authorization, on the other hand, allows you to use different authorization rules when accepting connections to a specific socket.io namespace (more on namespaces can be found [here](http://socket.io/#how-to-use))

In this article I will examplify only how to enable Global authorization, although from the looks of things, namespace authorization is straightforward once you understand global autorization.

## A Few Words about Timing

It's important to understand that the authorization process takes place during the 'handshake'. This means that, prior to authorization, no socket connection is established. As a matter of fact, because the handshakes in socket.io are implemeneted as HTTP calls, one can use the HTTP context to get relevant information on the user who's trying to connect. As you'll see next, I will be using cookie data to authorize any user that tried to establish a socket connection to the server.

## Session-based Authorization

As I said, I will be using cookie data to authorize our John Dow. Specifically, I will be using the user's session id to make sure that indeed this user went through the system. The trick here is to use Express' session middleware to assign a signed session id to the user, so the next time he sends a request - during socket.io handshake process - it will be possible to ascertain that this user is a valid user and not a scoundrel. Theoratically, I could also fetch more information about the user using his session id, but I felt that it's out of scope for this article. I admit that this kind of autorization method is naive, but it's good enough to get you started.