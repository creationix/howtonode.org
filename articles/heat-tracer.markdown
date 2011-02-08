Title: Realtime Performance Visualizations using Node.js
Author: Geoff Flarity
Date: Sun Feb 06 2011 20:36:43 GMT-0500 (EST)
Node: v0.3.8


This article outlines how create a realtime heatmap of your syscall latency using HTML5, some great node modules, and DTrace. It was inspired by talk that Bryan Cantrill and Brendan Greg gave on Joyent's cool cloud analytics tools. While specific, the code provided could easily be adapted to provide a heatmap of any type of aggregation Dtrace is capable of providing. 

## System Requirements

First thing's first, you're going to need a system with DTrace. This likely means Solaris (or one of its decedents), OS X, or a BSD variant.  There doesn't appear to be Dtrace available for Linux. 

## Security

Secondly, please be aware that at the time of writing the demo code contains a fairly substantial secruity vulnerabilty. Namely the d script is sent from the client with no authentication what so ever. If you bind to localhost this shouldn't be a big deal for a demo. Time permitting I intend to clean up the code.  

## Dependencies 

For this tutorial you'll also need:

    node - http://nodejs.org/#download (duh)
    npm - https://github.com/isaacs/npm (makes installing modules a breeze)
    node-libdtrace - https://github.com/bcantrill/node-libdtrace (provides dtrace functionality)
    Socket.IO - 'npm install socket.io' (web sockets made easy)

## Server

Now we're ready to start writing our web server: 

<heat-tracer/heat_tracer.js>

## Client

In order to display our heatmap, we're going to need some basic HTML with a canvas element:

<heat-tracer/public/heat_tracer.html>

Finally the JavaScript client which translates the raw  streaming data into pretty picture:

<heat-tracer/public/heat_tracer_client.js>

## Run It!	

Run Heat Tacer with the following. Note, sudo is required by dtrace as it does kernal magic.
    
    sudo node heat_tracer.js

If all goes well you should see something a moving version of something like the image below.

> ![Alt value of image](heat-tracer/heat_tracer.png) 

## Contribute


You can find the latest version of Heat Tracer [here](https://github.com/gflarity/Heat-Tracer). It is my hope that this article will provide the ground work for a much more abitious performance analytics project. If you're interested in contributing please let me know.

## Further Research

More information about Bryan and Brendan's demo can be found [here](http://dtrace.org/blogs/brendan/2011/01/24/cloud-analytics-first-video/).

Socket.IO can be found [here](http://socket.io/).
