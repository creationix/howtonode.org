Title: Unit Testing Node.js with Futures
Author: Ryan Gerard
Date: Mon, 2 Apr 2012 10:40:19 GMT
Node: v0.6.14

Recently I decided to investigate and prototype methods of unit testing my node.js codebase.  There are some decent resources out there that cover this topic, and this post is a summary of my own thoughts and findings while implementing unit testing for node.js.

Lets start with the basic issue: testing asynchronous code is not straight forward. For most unit testing, you assume items will move in a linear fashion: execute some of your code, and verify some expected result. Because node.js forces you to work in a more async fashion, you may not necessarily know when something is complete, which forces us to look for other ways to find out when that something is complete.

### A Simple Node.js App

I’ve written below a contrived and simple node.js app, using express and mongodb, that uses a login mechanism.  We want to unit test the login mechanism.  For the sake of brevity, I've removed some of the boilerplate code that comes standard as part of an express app:

<unit-testing-with-futures/login.js>

As you can see, it’s pretty straight forward: a POST request containing an email address and password are searched for in the mongodb instance.  If that user exists, then return that user object.

Now, lets take a step back for a moment and start building a simple unit test for this mechanism.  To do this, I’ve been using [Nodeunit][], which provides a reliable and simple framework for executing tests, and reporting results.  Here is an example of how I’d like to write the test:

<unit-testing-with-futures/login-unit.js>

This is a simple test that merely verifies that a specific user/pass combo doesn't result in a null user object.  If this test were supported by the application code, then exeuting "nodeunit login-unit.js" should result in a positive output.

### Supporting the Unit Test

Clearly our application code can’t yet support this unit test.  The login logic needs some refactoring so that it’s externally accessible:

<unit-testing-with-futures/login-refactored.js>

As you can see, we’ve added an export function for the login code, so that the unit test can access the exact same login code as the main express app.  

However, there is a problem.  Due to the asynchronous nature of node.js, that user value from the private function is not being returned correctly.  The private function will return immediately, and not wait for the db call to finish.

### Using Futures

To fix this, we will use futures, which are also commonly called promises, or deferred objects.  To learn more about this concept, this [MSDN Article][] sums up the concept well.

I’m currently using the [Futures][] module provided by [coolaj86][], but there are [other][] modules out there, and I encourage you to experiment.  If we refactor the application code to use futures, it will look like this:

<unit-testing-with-futures/login-final.js>

The changes above show one way to work around the async nature of node.js for testing purposes.  The changes work as follows:
- The private login function will create and return a new future object immediately to the caller
- The caller will then essentially subscribe to an event using future.when().  This event is called when the object is "ready".
- When the async database call is finished, the future.deliver() function is called, and the results of the database lookup are passed into the call
- The future.deliver() call delivers the data to the callback function created in future.when()

We can refactor the unit test code to also use futures, and thereby effectively test out the login functionality:

<unit-testing-with-futures/login-unit-final.js>

Voila! We now have proper unit testing of asynchronous code.  In the unit test, we don't consider the test "done" until the future.when() call is triggered by the future.deliver() call.  This allows the test to asynchronously wait for the database call to be completed before examining the results of the call to determine if the test should pass.

### Using Callbacks

Some of you may wonder why we need to use futures at all.  Indeed, we could just send in a callback function as an extra parameter to the login function that would get called when the async call is finished.  That code would look something like this:

<unit-testing-with-futures/login-with-callbacks.js>

However, there are other benefits to using futures:
- Chaining of future objects is possible
- Default timeouts can be set on the future object that return an error if the object isn't delivered within a specified time period
- A context can be set that will be passed into the future object whenever a message is delivered

These are just a few of the benefits that come with using a futures.  Personally, I like the fact that using futures enforces a type of contract on what parameters the callback needs to accept.

### Conclusion

To recap, what I’ve been trying to show today is that using futures/promises/deferred objects are effective ways to unit test node.js code, despite it’s asynchronous nature. The future objects returned from the private login method allow you to essentially subscribe to an event that tells you when the async call is finished, and passes back the result of that async call.  In addition, I believe the above code is more structured, less brittle, and easier to read.

Now that I have a method to unit test my node.js code, I can happily move forward and have some degree of certainty that my code is working correctly.

  [Futures]: https://github.com/coolaj86/futures/tree/v2.0/future
  [Nodeunit]: https://github.com/caolan/nodeunit
  [MSDN Article]: http://blogs.msdn.com/b/rbuckton/archive/2010/01/29/promises-and-futures-in-javascript.aspx
  [coolaj86]: https://github.com/coolaj86
  [other]: https://github.com/kriszyp/node-promise
