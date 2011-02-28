Title: How To Module
Author: Isaac Z. Schlueter
Date: Mon Feb 28 2011 11:07:42 GMT-0800 (PST)
Node: v0.4.1

These are some basic steps for writing a NodeJS module.

Most of the suggestions in this document are optional.  You
can definitely write your program however you like, and many in the
node community enjoy trying out new creative ways of doing things.

This is merely a set of patterns that noders have found to work for
them and their projects.

## Use Git

Most people in the node community use git for all their version control
needs.  It is an extremely powerful and robust tool.  If you don't
already use it, you should.

Don't wait until your program is "ready" before using git on it!  Run
`git init` in the root of your project folder right away, and commit
your changes as you make them.  It is a good habit, and can help avoid a
lot of painful mishaps.

If you wish to share your program with others, then github is also a
tremendously useful resource that most nodejs developers use.

## A package.json File

Create a file in the root of your program named `package.json`.  This
file is a json description of what's in your project.  If you're just
writing a standalone server or website that isn't intended to ever be
shared, then this is not strictly necessary, but it still does make some
things more convenient.

If you plan to publish your program and let others install it using
[npm](http://npmjs.org/), then a package.json file is essential.

You can specify in this file:

* Name, version, description, and keywords to describe your program.
* A homepage where users can learn more about it.
* Other packages that yours depends on.

If you have installed [npm](http://npmjs.org/), then you can use the
`npm init` command to get started.  See `npm help json` for lots of
information about everything you can put in this file.

If you are writing a program that is intended to be used by others, then
the most important thing to specify in your `package.json` file is the
`main` module.  This is the module that is the entry point to your
program.

Documenting your dependencies is really handy.  It is a very polite
practice if you are going to share this program with others, and it
provides a lot of useful techniques if you are deploying it somewhere.

## README, and other docs

Put basic entry-level documentation about your program in a README file
in the root of your project.

If you enjoy the markdown format, you can write it in markdown, and save
the file as README.md.

Seriously, do this!  Even if you think you'll never have users, history
teaches us that you'll go off and forget what this thing is for, and
then come back to it and curse yourself for not documenting it even a
little.

So document it.  Even a little.

If you feel so inclined, it's also a great idea to put documentation in
a folder called `./docs`.  Markdown files should end in `.md` and html
should end in `.html`.

## Testing

There is a ton of information out there convincing you about the
importance of testing and documentation.  I don't have to tell you how
important that is.  It's really important, and that should be obvious.
Do it.

What's not quite so obvious is *how* you should go about doing this.

First of all, testing.

There is no single way that all node modules get tested.  The node
program itself uses a python-based system that runs all the JS files in
a particular directory.  Most of those files just throw if they find an
error, and since the tests are very low-level, that is a good system.

Other projects find it useful to use test harnesses like vows or
expresso.  Whatever testing option you go with, it's worth it.  Write
tests.

If you are writing a re-usable program that you want to distribute to
others, you should also add `"scripts":{"test":"run some program"}` to
your package.json file.  What that lets you do is `npm test my-program`
to run the command you specify.

Plans are underway to do interesting things with the test scripts and
doc directories of packages that get published to the npm registry.

## What kind of thing are you making?

Generally, node modules fall into these rough categories:

* A binding to some C or C++ library.
* A library of functionality to be used in other node programs, written
  primarily in JavaScript.
* A command-line program.
* A website or server or something.  (That is, an implementation that
  you'll put on an actual server, not a framework.)

There is a lot of overlap in these categories.  A thing doesn't have to
be just one sort of thing.

## Writing a Binding

Typically, C++ source code is put in a subdirectory of your project
called `./src`.  C++ files usually have the extension `.cc`.  C files
usually have the extension `.c`.

Generally, the simplest and best approach is to put the minimum
necessary effort into the C++ layer, and then make the functions "nice"
by wrapping a JavaScript layer around the raw binding.

Node programs use the included `node-waf` program to compile.  Create a
`wscript` file with the appropriate rules in it, and then run `node-waf
configure build` to build your module.

Use the `eio` thread pool to do any actions that perform synchronous
I/O.  Note that v8 constructs may not be used on the thread pool, so
data types must be passed into the sync code blocks as eio_request
structs.

See these examples to get started building a binding that leverages
eio and node-waf:

Example hello-world-ish programs:

* <https://github.com/pkrumins/node-async>
* <https://github.com/isaacs/node-async-simple>

Examples:

* <https://github.com/pkrumins/node-png>
* <https://github.com/mranney/node_pcap>
* <https://github.com/ry/node_postgres>
* <https://github.com/isaacs/node-glob>

## Writing a Library

If you have a lot of JavaScript code, then the custom is to put it in
the `./lib` folder in your project.

Specify a `main` module in your package.json file.  This is the module
that your users will load when they do `require('your-library')`.  This
module should ideally expose all of the functionality in your library.

If you want your users to be able to load sub-modules from the "guts" of
your library, then they'll need to specify the full path to them.  That
is a lot of work to document!  It's better and more future-proof to
simply specify a main module, and then, if necessary, have ways to
dynamically load what they need.

For example, you might have a `flip` library that is a collection of
`widget` objects, defined by files in the `flip/lib/widgets/*.js` files.
Rather than having your users do `require('flip/lib/widgets/blerg.js')`
to get the blerg widget, it's better to have something like:
`require('flip').loadWidget('blerg')`.

Of course, a library may also include a build step that compiles an
add-on that it uses.

Since libraries take so many different shapes for different purposes,
there isn't really a single way to do it.

Examples:

* <https://github.com/learnboost/Socket.IO-node>
* <http://documentcloud.github.com/underscore>
* <https://github.com/visionmedia/connect>
* <https://github.com/mikeal/request>
* <http://github.com/tmpvar/jsdom>

## Writing a Command Line Program

The only feature that differentiates a command-line program from a
library is the `bin` field in the package.json file.

When installed with npm, the `bin` field in a package.json file tells
npm to create an executable in the PATH that runs your program.

In a nodejs script, the `process.argv` is an array of strings that
represent the command the user started node with.  The first item is
always node, and the second is always your program.  Generally, the
arguments to your program can be retrieved via:

    var args = process.argv.slice(2)

There are a variety of option parsing libraries available via npm.

The current working directory can be found by calling `process.cwd()`,
and changed with `process.chdir(newPath)`.

Examples:

* <http://npmjs.org/>
* <https://github.com/zpoley/json-command>
* <https://github.com/cloudhead/vows>
* <https://github.com/LearnBoost/cluster>

## Writing a Standalone Server

This is probably the most "normal" node programming model.  You just
want to *use* these modules, and most likely have no intention of
distributing it for others.

To be most effective, it's often a good idea to avoid trying to
re-invent sections of your program that can be accomplished using
others' modules.  npm is a wonderfully helpful tool here.  If you're
planning on using Redis in your site, you can do `npm ls redis` to look
for modules that might provide bindings to it.

Also, the [npm search site](http://search.npmjs.org/) is extremely
helpful.  There, you can search using the same keyword greps as `npm
ls`, but it also shows which packages depend on which other ones, the
dates of previous releases, the owner information, and so on.

It's very important, when designing your program, to consider where you
are planning on deploying it, and how.  Joyent has a node hosting
service at <http://no.de/>.  When you push your code to the no.de site,
it will automatically restart the server by running the `server.js` file
in the root of your project.  So, it's a good idea to make that your
entry point.

No matter where you decide to deploy your program,
any dependencies that you place in a `node_modules` folder in the root
of your program will be loaded as if they are native modules.  So, if
you drop the `redis` package into `./node_modules/redis` then you could
do `require('redis')` in your program to load it.  This makes it very
easy to re-use code, while still keeping the tested versions of your
dependencies with your code.

## Don't forget...

The node community is growing fast, and welcomes your struggles and
experience.  If you run into troubles, jump in the #node.js IRC channel
on irc.freenode.net, or ask on the [nodejs mailing
list](http://groups.google.com/group/nodejs).

If you build something useful, publish it with [npm](http://npmjs.org/),
and tell people about it.

Have fun!
