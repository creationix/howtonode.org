Title: Websockets everywhere with Socket.IO
Author: Guillermo Rauch
Date: Wed Sep 29 2010 12:11:39 GMT+0530 (IST)

If you've stayed on top of the advances in the realtime web for the past few years, you've probably heard of different techniques aimed to reduce the latency (ie: speed) of the message exchange between a client and a server. If you're developing a multiplayer game, a chat application, or showing frequent updates of data like tweets or stock price changes, you probably want to **reverse** the traditional model of communication. So instead of requesting (polling) data on a specific interval of time, you want the server to send (push) data to the client.

Nowadays, terms like `long polling`, `comet` and `WebSocket` come to mind when it comes to developing a realtime web application or widget. But it's not always obvious how they work, their advantages, disadvantages and limitations, or even what percentage of the web browser market share supports them.

[Socket.IO](http://socket.io) is a lightweight API that runs on the browser and looks like this:

<websockets-socketio/socketio-sample.js>

If you're familiar with `WebSocket`, the protocol that aims to simplify bi-directional communication over HTTP once and for all, you'll notice that it looks **very** similar. The difference is that Socket.IO, under the hood, will enable realtime communication for IE6-9, Firefox 3-4, Safari 3-5, Chrome 3-6, iOS (iPhone and iPad), and other commonplace user agents.

## Revisiting the history of the realtime web

In this day and age, odds are that if you're a web developer you've used AJAX once or twice. Very much like what socket.io does for realtime, libraries like `jQuery` have provided abstractions that aim to remove the incompatibilities of what browsers offer for asynchronous HTTP requests (IE uses a proprietary ActiveX object, and mostly everyone else uses the standard XMLHttpRequest).

Now, if you wanted to make a realtime widget that retrieves data from the server, your first idea might look somewhat like this:

	setInterval(function(){
    	$.ajax({ url: '/my/page', success: function(data){
        	// do something with the data
    	} });
	}, 5000);

So, every 5 seconds we `poll` the server for new updates. In my book, that's almost as efficient as the [transmission of IP Datagrams on pigeons](http://www.rfc-editor.org/rfc/rfc1149.txt).

You might also want to try to reduce the interval, and say, put it at 100 milliseconds.

	setInterval(function(){
    	// now this should be fast!
    	$.ajax({ url: '/my/page', success: function(data){} });
	}, 100);

However, we're ignoring two major downsides now:

* The HTTP latency. Chances are that a complete roundtrip of the packets on a high speed internet connection will be around 200ms. But this is not always the case! If it were 500 or higher, then things might slow down. And they might slow down unnecessarily, because:
* The server might not have any new data for us. In this case, we'd be producing a lot of network traffic, and request/response cycles overhead, for no purpose.

## Introducing long polling

Long polling addresses the weakness of traditional polling methods by asking the server for new information on a certain interval, but keeping the connection open if the server has nothing new for us. This technique dramatically decreases latency and network traffic, which means it efficiently disguises itself as a server-push technique.

	function load(){
    	$.ajax({ url: '/my/page', success: function(){
        	// do something with the data
    	}, complete: load, timeout: 20000 });
	}

## How about keeping the connection open?

If you come from a more traditional programming environment (eg: Desktop software), you're probably wondering why we don't keep the connection open.

This is possible with at least two fairly well known techniques:

* XMLHttpRequest and the `multipart/x-mixed-replace` MIME type (which is enabled by setting `multipart = true` in the XMLHTTPRequest instance)

Although it was introduced by Netscape in 1995 (yes, when some of us were still unable to read properly), the only commonplace user agent to support it is Firefox.

* An `<iframe>` populated with a response with the headers `Transfer-encoding: chunked` and `Connection: keep-alive`.

The technique consists of writing `<script>` tags that call a function on the parent page as information becomes available to push to the client.

The disadvantage of this method is that it'll trigger a never-ending spinner or progress bar in most user agents, severely hurting the user experience. In Internet Explorer, this can be worked around by inserting the `<iframe>` in a hidden document (via the obscure ActiveX object `htmlfile`). This technique was exposed to me for the first time thanks to the Gmail Chat team. This gem was [analyzed/discovered](http://infrequently.org/2006/02/what-else-is-burried-down-in-the-depths-of-googles-amazing-javascript/) back in the day by Alex Russell

By now, it's obvious that some lower-latency techniques are available to certain user agents, under certain conditions. The fundamental problem is that now the server has to treat HTTP requests differently, altering

* The headers sent with the response (Content-Type, Connection, etc).
* The duration (a timeout is required for long-polling, but not all the others)
* The "framing" of the messages. For multipart, each message has to be accompanied by a delimiter (boundary).
* Random quirks (IE requires a certain number of dummy bytes at the beginning of the document streamed through the iframe).

All these techniques try to minimize the latency of the **incoming** data from the server, but normal XMLHTTPRequest have to be used to **send** data from the client. Which brings us to the most optimal solution available today.

## One transport to rule them all

Meet WebSocket, an effort "to provide a mechanism for browser-based applications that need two-way communication with servers that does not rely on opening multiple HTTP connections", as the author Ian Hickson [puts it](http://tools.ietf.org/html/draft-hixie-thewebsocketprotocol-76).

WebSocket takes advantage of the Upgrade header of the HTTP/1.1 specification, which means it's essentially a new protocol for communication:

	The Upgrade general-header allows the client to specify what additional communication protocols it supports and would like to use if the server finds it appropriate to switch protocols.
	Examples: HTTP/2.0, SHTTP/1.3, IRC/6.9, RTA/x11
	http://www.w3.org/Protocols/rfc2616/rfc2616-sec14.html

WebSocket won't close the connection after sending a message or receiving one. It's essentially "TCP for the web", but with a security model built in the protocol, a fairly rare framing system and UTF-8 encoding (no binary).

If we choose to implement it, some of the problems stated above still hold true:

* The server has to give special treatment to the WebSocket requests, performing a handshake unique to the WebSocket protocol, and implement its new security system.
* WebSocket is only supported by the most cutting-edge browser engines on the Desktop, a minority of the web population.

## Node.JS koolaid to the rescue

Node.JS presents developers with a truly unique and exciting possibility: rolling your own scalable non-blocking HTTP server in one of the most popular dynamic scripting languages of all time, with a simplistic API.

Writing a (dummy) long-polling server is as easy as:

<websockets-socketio/longpolling.js>

Even with this simple API, consolidating your app logic in a way that works across all transports can be difficult.

`Socket.IO-node` is here to help: Here's a chat server in 10 lines of code that also announces (broadcasts) who connects to the server:

<websockets-socketio/broadcasts.js>

And the best part is, under the hood, it'll handle your WebSocket, WebSocket over Flash, long polling, multipart and iframe connections. Sweet, isn't it?

## Further reading

If you want to learn more about Socket.IO, be sure to watch the [git](http://github.com/learnboost/socket.io) [repositories](http://github.com/learnboost/socket.io-node), and check out some of the projects people have created with it:

* <http://github.com/substack/dnode>
* <http://github.com/jacobthornton/space-tweet>
* <http://github.com/mkilling/alfamegle>
* <http://github.com/deserat/sock-drawer/>
* <http://github.com/gerad/lazeroids-node/>

