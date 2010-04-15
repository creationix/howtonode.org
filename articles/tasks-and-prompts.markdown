Title: Tasks and Prompts -- Implementing Simple Work Queues
Author: R. S. Doiel
Date: Sun, 28 Feb 2010 00:50:22 GMT
Node: v0.1.90


Sometimes all you really need is orderly execution not blocking I/O to get the job done.  Tasks and prompts is a light weight implementation of the work queue design pattern.

## Implementing Simple Work Queues

The other day I was converting a couple Bash installer scripts to node scripts. I recognized a familiar design pattern -- the work queue. Here's the requirements for a typical work queue approach -

* tasks are queued, first in first out (i.e. tracked)
* tasks once started continue without further intervention
* tasks are independent (i.e. task A does not depend on task B or visa versa)
* tasks are execute once

## My requirements

* tasks fired in sequence without concern for when they complete
* some tasks required a prompt and response before firing
* I wanted to queue tasks and prompts before running the work queue

A simple JavaScript array works fine as a first in first out queue (i.e. shift() pops the zeroth position off). An object's properties can keep track of what text I wanted to displayed; the callback to be fired; and if I need to show a prompt or get a response when firing a callback. tasks-and-prompts.js is a simple example of doing that:

<tasks-and-prompts/tasks-and-prompts.js*>

## Explanations

In this simple example I prompt the user to answer a question then count to three. Pretty trivial but it's an implantation of a the work queue pattern. That pattern is common in installation or management scripts.  The only problem with the example above is that it isn't setup as a node module ... wait I did that already! See [github.com/rsdoiel/nshtools](http://github.com/rsdoiel/nshtools). nshtools.js has a more elaborate implementation and includes some other features like command line option processing, mixins of sys, path and fs modules, and high level file commands like cp and mv. The github wiki and the README.md file for nshtools have some more short examples for your enjoyment.

Have fun!
