Title: Intro to Jake - JavaScript build tool for Node.js
Author: Matthew Eernisse
Date: Wed Sep 29 2010 12:39:01 GMT+0530 (IST)

Jake is a JavaScript build program for Node.js, with capabilities similar to GNU Make or Ruby's Rake. If you've ever built projects with Rake, you'll be very at home using Jake

Jake has the following features:

* Jakefiles are in standard JavaScript syntax
* Tasks with prerequisites
* Namespaces for tasks
* Async execution of tasks

## Installing

**Requirements**: Jake requires Node.js. Of course.

Get Jake:

	git clone git://github.com/mde/node-jake.git

Build Jake:

	cd node-jake && make && sudo make install

Or install with NPM:

	npm install jake

(Or, get the code, and `npm link` in the code root.)

## Basic usage

	jake [options] target (commands/options ...)

You can see what other options Jake supports by doing `jake -h` or `jake --help` Probably the most important option starting off is the `-T` or `--tasks` option that lets you see what tasks are defined in a Jakefile.

## Jakefiles and Jakefile syntax

You define your build tasks in a Jakefile.js (usually in the root of your project) -- by default the `jake` command looks for a Jakefile in the current directory, but you can also point Jake at a specific file using the -f (--jakefile) flag.

In your Jakefile, call `task` to define tasks. Call it with three arguments (and one more optional argument):

	task(name, dependencies, handler, [async]);

Where `name` is the string name of the task, `dependencies` is an array of the dependencies, and `handler` is a function to run for the task.

Here's an example:

<intro-to-jake/sample-jakefile.js>

This is a build tool for Node, so of course we want to support async execution, right? The `async` argument is optional, and when set to true `(async === true)` indicates the task executes asynchronously. Asynchronous tasks need to call `complete()` to signal they have completed.

Here's an example of an asynchronous task:

<intro-to-jake/async-jakefile.js>

Use `desc` to add a string description of the task.

Use `namespace` to create a namespace of tasks to perform. Call it with two arguments:

	namespace(name, namespaceTasks);

Where is `name` is the name of the namespace, and `namespaceTasks` is a function with calls inside it to `task` or `desc` defining all the tasks for that namespace.

Here's an example:

<intro-to-jake/namespace-jakefile.js>

In this example, the foo:baz task depends on both the 'default' and the 'foo:bar' task.

Run these namespaced tasks with `jake [namespace]:[task]`. The above example would be run with:

	jake foo:baz

## 	Passing parameters to jake

You can pass either positional or named parameters to Jake tasks (well, 'named parameters,' the JavaScripty way, in an Object).

Single parameters passed to the jake command after the task name are passed along to the handler as positional arguments.

So you can see this in action, let's set up an 'awesome' task that does nothing but print out the arguments it gets:

	desc('This is an awesome task.');
	task('awesome', [], function () {
	  console.log(sys.inspect(Array.prototype.slice.call(arguments)));
	});

With this example, running `jake` like this:

	jake awesome foo bar baz

You'd get the following output:

	[ 'foo', 'bar', 'baz' ]

Paramters passed to the jake command that contain a colon (:) or equals sign (=) will be added to a keyword/value object that is passed as a final argument to the handler.

With the above Jakefile, you could run `jake` like this:

	jake awesome foo bar baz qux:zoobie frang:asdf

And you'd get the following output:

	[ 'foo'
	, 'bar'
	, 'baz'
	, { qux: 'zoobie', frang: 'asdf' }
	]

As you might expect if you're used to Make or Rake, running `jake` with no arguments runs the default task.

## Related projects

James Coglan's "Jake": <http://github.com/jcoglan/jake>

Confusingly, this is a Ruby tool for building JavaScript packages from source code.

280 North's Jake: <http://github.com/280north/jake>

This is also a JavaScript port of Rake, but it runs on the JVM-based Narwhal platform.

