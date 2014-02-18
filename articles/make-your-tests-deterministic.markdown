Title: Make Your Tests Deterministic
Author: Vojta Jina
Date: Tue Aug 13 2012 01:12:01 GMT-0800 (PST)
Node: v0.8.4


Non-deterministic issues like [race conditions] or [thread deadlocks] are very difficult to test, because they are by nature hard to reproduce. Fortunately, in the JavaScript world, we only have a single thread, so we are safe, right? Well, not really because...

**Execution order of callbacks can cause the same race condition issues that plague multi-threaded environments.**


## Example

Let's say we need a function that will return an array of timestamps representing the last modification time of a set of files.

<make-your-tests-deterministic/get-last-modified.js>

To unit test this code, we need to mock out `fs` module (using real file system would require setting up some initial state, cleaning up afterwards and would make the test slow). That's pretty easy with [node-mocks] - we can use a fake in-memory file system.

<make-your-tests-deterministic/get-last-modified.spec.js>

This unit test passes, but the production code is broken. Even worse, it sometimes works, sometimes it does not... The problem is that this code relies on the order of `fs.stat` callbacks, which is preserved in the mock version of `fs`, but can't be guaranteed on real fs - it's non-deterministic.


## Solution

Our solution needs to simulate the problematic behavior during the test.

We could make the fake `fs` to fire callbacks in a random order, which would be very similar to the real `fs` behavior. However, that would result in a flaky tests that sometimes pass, sometimes not - just like our production code. Yep, we could do "stress" testing - execute the test multiple times, to make the probability of failing bigger, but that's still flaky.

What we really want is our tests to be always deterministic - reliable, not flaky. So we need to simulate this behavior in a predictable - controlled way.
That's why the `fs` mock uses something called `predictableNextTick`, which behaves similar to [process.nextTick], but fires callbacks in a specific order.

Let's add this line into our unit test:

    mocks.predictableNextTick.pattern = [1, 0];

Suddenly, the test is failing, because now the `fs.stat` callbacks are fired in different order than they were registered. They are fired in order specified by the pattern - second callback first, then first, then fourth, then third, etc...

**The important thing is, they are ALWAYS fired in THIS order. It's predictable, deterministic !**

This was very simple example of an issue, that can easily happen when dealing with asynchronous APIs. The same type of issues can happen in web applications as well, for instance by sending multiple xhr requests.
**In production, this behavior is out of our control. However, in order to guarantee correct behavior of our code, we need to be sure that it handles correctly all these different situations. The best way to do that is by simulating these situations in a fully controlled - a deterministic way.**



The full source code of `predictableNextTick` implementation can be found on [github].

The full source code of this example is on [gist].


[thread deadlocks]: http://en.wikipedia.org/wiki/Deadlock
[race conditions]: http://en.wikipedia.org/wiki/Race_condition
[node-mocks]: https://github.com/vojtajina/node-mocks
[github]: https://github.com/vojtajina/node-mocks/blob/master/lib/util.js
[gist]: https://gist.github.com/3283670
[process.nextTick]: http://nodejs.org/api/process.html#process_process_nexttick_callback
