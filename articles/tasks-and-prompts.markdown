Title: Tasks and Prompts -- Implementing Simple Work Queues
Author: R. S. Doiel
Date: Sun, 28 Feb 2010 00:50:22 GMT

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


    var sys = require('sys'), /* We need the sys module */
        work_queue = []; /* This holds our first in, first out queue of prompts and tasks */
    
    /* This is the method we used to put prompted items into the work queue.
       prompts will pass a response to the callback method. */
    prompt = function (msg, callback) {
      /* A queued item has some text, a callback and a work queue type (i.e. work_type) */
      work_queue.push({'text' : msg, 'callback' : callback, 'work_type' : 'prompt'})
    };

    /* task puts items into the work queue that don't require a prompt and response.
       tasks don't wait for an answer, they just get fired. Since no response is
       pending the callback will get called without any parameters. */
    task = function (label, callback) {
      work_queue.push({'text' : label, 'callback' : callback, 'work_type' : 'task' });
    };

    /* This is our work horse function.  It runs all the tasks and prompts */
    run = function() {
      /* this is just a convenience inner function to make the code easier to read. 
         it fires off tasks until it finds a prompt or nothing is left in the
         work queue. */
      taskRunner = function () {
        var action; /* Place holder for action we shift out of the queue */
        while (work_queue.length > 0) {
          /* If next queued item is a prompt, show the prompt and exit taskRunner. */
          if (work_queue[0].work_type === 'prompt') {
            sys.puts(work_queue[0].text);
            return;
          }
          /* If we have a task we show the text associated with the task and
             fire off the callback. Notice we don't wait for it to return.
             Work queue only insures the order of firing not anything else. */
          if (work_queue[0].work_type === 'task') {
            action = work_queue.shift();
            sys.puts(action.text);
            action.callback();
          }
        }
      };

      /* Process any tasks in the work queue that might be ahead of prompts */
      taskRunner();
      /* We only open stdio and add a listener if we have items which prompt. */
      if (work_queue.length > 0) {
        process.stdio.open();
        process.stdio.addListener('data', function (response) {
          /* Now that we're listening we either handle a prompt or handle a task
             until the work queue is empty. */
          while (work_queue.length > 0) {
            if (work_queue[0].work_type === 'prompt') {
              action = work_queue.shift();
              action.callback(response);
            }
            /* If any tasks, prompts run next */
            taskRunner();
          }
          if (work_queue.length === 0) {
            process.stdio.close();
          }
        });  
      }
    };

    /*
     * Now let's setup some tasks and prompts to do some work
     */

    /* You might prompt to do some setup before firing your tasks */
    prompt("Are you there? ", function (data) {
      sys.puts("Answer was: " + data);
    }); 
    
    /* Tasks run unattended. work_queue only ensures the order 
       the callbacks are fired not order of completion */
    task('Count to three:', function () {
      for (i = 1; i <= 3; i += 1) {
        sys.puts("count: " + i);
      }
    });
    
    /* Since run might open/close stdio it needs to be the last thing called. */
    run(); 


## Explanations

In this simple example I prompt the user to answer a question then count to three. Pretty trivial but it's an implantation of a the work queue pattern. That pattern is common in installation or management scripts.  The only problem with the example above is that it isn't setup as a node module ... wait I did that already! See [github.com/rsdoiel/nshtools](http://github.com/rsdoiel/nshtools). nshtools.js has a more elaborate implementation and includes some other features like command line option processing, mixins of sys, path and fs modules, and high level file commands like cp and mv. The github wiki and the README.md file for nshtools have some more short examples for your enjoyment.

Have fun!
