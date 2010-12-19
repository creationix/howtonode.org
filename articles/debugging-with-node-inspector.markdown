Title: Debugging with node-inspector
Author: Danny Coates
Date: Sat Sep 11 2010 16:42:29 GMT-0700 (PDT)
Node: v0.2.1

This was the fourth in a series of posts leading up
to [Node.js Knockout](http://nodeknockout.com/) on how to
use [node.js](http://nodejs.org/). This post was recorded
by [node-inspector](http://github.com/dannycoates/node-inspector) author
and [Node.js Knockout judge](http://nodeknockout.com/judging#danny_coates) Danny Coates.

## Video

Check out this sweet screencast where Danny explains how to use
[node-inspector](http://github.com/dannycoates/node-inspector):

<object height="300" width="500"><param name="movie" value="http://www.youtube.com/v/AOnK3NVnxL8&hl=en&fs=1&hd=1" /></param><param name="wmode" value="window" /><param name="allowFullScreen" value="true" /></param><param name="allowscriptaccess" value="always" /></param><embed src="http://www.youtube.com/v/AOnK3NVnxL8&hl=en&fs=1&hd=1" allowfullscreen="true" type="application/x-shockwave-flash" allowscriptaccess="always" wmode="window" height="300" width="500"></embed></object>

## Transcription

Hi this is Danny Coates. Since Node Knockout is coming up pretty soon I'd like to give you a quick introduction to Node Inspector, which is a graphical debugger for Node.

It's hosted on GitHub, you can go check it out there. Let's get started with the demo. To start the inspector I'm going to run it from the node-chat directory (node-chat is a sample application), like this:

    $ node ../node-inspector/bin/inspector.js --start-brk=server.js \
        --forward-io --profile

When I pass it the `--start-brk` parameter we're going to end up with two processes; the one we're debugging will be a child process of the inspector process. If I quit the profile it'll also close down the node-chat app.

Let's pull up the debugger. Since I did `--start-brk` intead of `--start` I'm going to get a breakpoint on the very first line; it's useful for debugging short lived apps.

Let me walk you through the interface. We have three panels; Scripts, Profiles (which isn't active in the main branch yet) and Console. The console is a standard JavaScript console; it'll run whatever you type in there in Node's V8.

There's also a pull down menu of your JavaScript files, and some controls to step over, step in, step out and pause the script. There are also expressions to watch, and the call stack. You can step to any level in the call stack. Beneath the stack you can see your locally and globally scoped variables, followed by your list of breakpoints.

If you click on a breakpoint it'll jump to the relevant line in your code.

Let's step through the node-chat app, to see what's going on. One of the nice things is that you can do a mouseover on some code, and it'll give you a popup of what that value is.

It looks like we're setting some intervals, hooking up some routes... That join function looks interesting, let's stick a breakpoint there, and then continue. We can pull up a mini console view, and we'll see that we've got some output on stdout (which is the same thing as the output on the command line).

Let's go ahead an open a couple of node-chat windows. Back in Node Inspector, we should have hit the breakpoint. If we want to see what simpleJSON does but we don't want to step in, we can mouse over it and get the source code in a popup.

Let's step in to create session. Then let's step out, and add a watch on sessions. Watches will update every time you hit a breakpoint or step through the code. Let's play through, and see me join the chat.

One of the other cool things you can do is live edit the code. If you just double click in the code you can then enter text that will be executed the next time the code is run.

You can also use the console to execute stuff, and this'll run in Node. console.log output will appear on the forwarded stdout, and in the regular stdout in the terminal.

One more thing; even though it doesn't work in the current main branch it's cool, so let's have a look. You can take a heap snapshot at any time, and you get to see the total number of objects, and the size of everything. You can then run the app some more, and take another snapshot; it'll give you a comparison between the two snapshots. If, for example, a count keeps going up, you might have a memory leak.

That's really the quick tour. If you're interested, go check out [Node Inspector on GitHub](https://github.com/dannycoates/node-inspector).

If you have any problems add an issue, and I'll look at that when I get a chance. Check out the Wiki for things that might be helpful.

Thanks for watching.