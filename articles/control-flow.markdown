Title: Control Flow in Node
Author: Tim Caswell
Date: Wed Feb 03 2010 00:34:10 GMT-0600 (CST)
Node: v0.1.102

One of the unique aspects of programming in an async framework like node is the ability to decide between which function will run in serial and which will run in parallel.  While there are no built-in methods for managing this in node, I'll discuss some of the tricks I came up with while writing the node-blog engine that generates this site.

## Parallel vs Serial ##

Usually in an application you have steps that can't run until the result from a previous step is known.  In normal sequential programming this is easy because every statement waits till the previous one finishes.

This is the case in Node too, except for functions that would otherwise perform blocking IO.  This includes things like scanning a directory, opening a file, reading from a file, querying a database, etc...

For my blog engine I have a tree structure of files that need to be processed.  Here are the steps I need to accomplish:

 - Get a list of articles.
 - Read in and parse the articles.
 - Get a list of authors.
 - Read in and parse the authors.
 - Get a list of HAML templates.
 - Read in all the HAML templates.
 - Get a list of static resource files.
 - Read in the static files.
 - Write article html pages.
 - Write author pages.
 - Write index page.
 - Write feed page.
 - Write static resources.

As you can see, there are several items that can be run independent of each other.  For example I can do all of the file reading at once without any problems, but I can't read any file until I've scanned the directory to know what files to read.  I can write all the files at the same time once their contents are calculated, but I won't know what to put in them until all the reads are done.

## A counter for grouped parallel actions ##

For the simple case of scanning a directory and reading all the files into one object, we can employ a simple counter.

<control-flow/simple-scanner.js>

Nesting callbacks is a great way to ensure they run synchronously.  So inside the callback of `readdir`, we set a countdown to the number of files to read.  Then we start a `readFile` for each of the files.  These will run in parallel and finish in any arbitrary order.  The important thing is that we're decrementing the counter after each one finishes.  When the counter goes back to 0 we know that was the last file to read.

## Passing callbacks to avoid excessive nesting ##

Now, if we wanted to execute more code now that we have the contents of the files, we would put it inside the inner-most nesting where the comment is.  This can become a problem real quick when a program has 7 levels of sequential actions.

So let's modify the example to pass callbacks:

<control-flow/scanner-with-callback.js>

Now we have made a composite asynchronous function.  It takes some arguments (the path in this case), and calls a callback when everything inside is done.  All the logic inside it, and importantly the several levels of nesting are now compressed into a single unnested callback.

## Combo library ##

I made a simple `Combo` library the other day.  It basically wraps up the task of counting events and calling a callback when the last one finishes.  Also it preserves the original order of callbacks registered irrespective of their actual response time.

<control-flow/Combo.js>

Suppose you wanted to read some data from a database and read some more data from a file, and then do something else once the two were completed.

    // Make a Combo object.
    var both = new Combo(function (db_result, file_contents) {
      // Do something
    });
    // Fire off the database query
    people.find({name: "Tim", age: 27}, both.add());
    // Fire off the file read
    fs.readFile('famous_quotes.txt', both.add());

The database query and the file read will happen at the same time.  When they are both done, then the callback given to the `Combo` constructor will get called.  The first argument will be the database result and the second will be the file contents.

## Conclusion ##

The techniques taught here are:

 - Nest callbacks to get serial behavior.
 - Collocate method calls to get parallel behavior.
 - Use callbacks to untangle nested serial actions.
 - Use counters to know when groups of parallel actions are finished.
 - Use libraries like `Combo` to ease the pain.

For a larger example of these patterns see the [build.js][] file in the [node-blog][] engine.

[build.js]: http://github.com/creationix/node-blog/blob/master/build.js
[node-blog]: http://github.com/creationix/node-blog