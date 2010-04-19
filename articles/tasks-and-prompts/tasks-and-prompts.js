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
    (function () {
      /* Open the standard input stream and set the encoding to UTF-8 */
      var stdin = process.openStdin();
      stdin.setEncoding('utf8');
      
      /* This is the callback for handing data events from standard input. */
      inputHandler = function (response) {
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
          stdin.end();
        }
      };
      
      /* This is the callback for doing all the cleanup. */
      cleanupHandlers = function () {
        stdin.removeListener('data', inputHandler);
        stdin.removeListener('end', cleanupHandlers);
      };
      
      /* Now that we have defined out handlers, add them as listners for data and end events. */
      stdin.addListener('data', inputHandler);
      stdin.addListener('end', cleanupHandlers);
    }());
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
