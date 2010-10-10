Title: Testing your JavaScript with shoulda.js
Author: Phil Crosby
Date: Wed Sep 29 2010 23:59:28 GMT-0700 (PDT)

The last thing you want this weekend is to be introducing bugs at 4:30PM on Sunday as you frantically hack in more functionality. One way to avoid that risk is to write some tests for your critical, stable bits. If you have time this weekend to hack on unit tests in between the red-bull-induced coma and the confused debates about sockets vs. ports (unlikely!), [shoulda.js](http://github.com/philc/shoulda.js) will help you get up and running very quickly.

Shoulda.js is a micro javascript unit testing framework inspired by Thoughtbot's Shoulda for Ruby. It gives you a tight syntax for writing terse, readable unit tests. It weighs in at under 300 lines and makes no assumptions about your javascript environment or libraries.

## Get Started

Here's how to get started. You've probably seen this pattern before: tests are grouped into logical units called "contexts". Contexts can optionally share test-case setup code. This is a sample test for a massively concurrent version of super mario we've written (the source for that is not included ;-) :

<testing-your-javascript/mario_tests.js>

You can run this file using v8:

    $ v8 mario_test.js
    Pass (19/19)

## Stubbing

The key to writing narrow, readable unit tests is stubbing out functionality to make your test easier to read and write. You'll often want to stub out expensive methods like talking to the network, or methods you want to manipulate in a special way to set up your test. Shoulda.js provides this syntax for stubbing out properties and methods:

    stub(document, "getElementById", function(id) { assert.equal(id, "marioCharacter"); });

or

    stub(document, "getElementById", returns(myElement));

## Writing client side unit tests for the browser.

If you want to write tests which need to leverage a full browser environment, use envjs. You can then test your client side javascript code from the command line, without having to launch an external browser.

Enjoy! And good luck.