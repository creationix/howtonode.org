Title: Testing With Platoon
Author: Daniel Lindsley
Date: Thurs Sep 09 2010 02:00:00 GMT+0500
Node: v0.2.0

ATTEN-SHUN! Privates, what we have here is a failure to communicate! Just because you're writing applications in the new shiny tech **DOES NOT** mean you have an excuse not to TEST! As your commanding officer, I am going to whip you back into shape with [Platoon](http://github.com/chrisdickinson/platoon)!

What? Soldier, what do you mean you do not know what Platoon is?! Drop and give me 20 while I educate you! Platoon is small & flexible unit-testing library that makes the built-in ``assert`` library look like a popgun!

## Welcome To Boot Camp (Installation)

Installation is easy & fairly standard. If you use ``npm``, you can simply:

> npm install platoon

Which will get you v0.0.3 at the time of writing. If you prefer a Git checkout, symlinking the package into your ``~/.node_libraries`` should work just as well.

With that, grab your gear and let's get down to it!

## Bringing Out The Big Guns (Getting Started)

If you pansies are going to live long enough to make it to my rank, you'd better get it straight that the only good gun is one mounted on a TANK:

<testing-with-platoon/tank_buggy.js>

An untested tank is a fast way to end up dead! So let's prove our tank's battle-worthiness. Create a ``tests`` directory alongside your code (which will help us out later). Inside that directory, drop a ``test_tank.js`` file and inside it, we'll start with the most basic check: Can we have a tank initialized
properly?

<testing-with-platoon/tests/test_tank_1.js>

There's a lot going on here, so we'll break it down. First, we require ``platoon`` just as we would any other module. We then add our test case to the ``exports``, which we're inventively calling ``TestTank``. We unleash a ``platoon.unit`` on it, which take some configuration options as it's first parameter. All other parameters are the individual tests to run. In this case,
we're only testing initialization of our ``Tanks``.

Each test takes an ``assert`` parameter, which we can use to override/extend the object performing the assertion. Though we won't cover it here, you could customize it to automate parts of your testing (inspect a certain combination of instance variables or repeat a set of actions). This is **NOT** the ``assert`` object that comes as part of Node, though it's basic API is virtually identical.

You'll also note that each test takes an optional string as the first line of the function. You can use this string as a description about what the test does, as we'll see shortly.

Finally, you perform the assertions & logic you need to make sure things are working properly. Now, weapons at the ready...aim...

## FIRE! (Running the Tests)

For the moment, to run these tests, you can do the following:

> $ cd tests

> $ platoon test_tank_1.js

If everything is in order, you should get:

<pre>
TestTank
    <span style="color: #00FF00">(6/6) Make sure we can have a tank of our very own.</span>
</pre>

Here's the first place where Platoon shines. This output tells you which test cases it ran (in this case, just ``TestTank``), lists out the ratio of tests that passed and outputs the description of which portion of the case just ran. For an added bonus, the output is properly color-coded, so we're all green.

Let's add some more tests to make sure we don't have any other bugs:

<testing-with-platoon/tests/test_tank_2.js>

If we run our tests now with ``platoon test_tank_2.js``, you'll see we've exposed a bug in our code. You should get output like:

<pre>
Ka-Boom!
Ka-Boom!
Ka-Boom!
TestTank
    <span style="color: #00FF00">(6/6) Make sure we can have a tank of our very own.</span>
    <span style="color: #00FF00">(4/4) Check that movement is working properly.</span>
    <span style="color: #FF0000">(5/6) Shoot the cannon!
            -1 should == 0
            at Object.<anonymous> (/Users/daniel/Desktop/howtonode.org/articles/testing-with-platoon/tests/test_tank_2.js:39:12)
        ... (full traceback here)</span>
</pre>

You can see we've made a mistake in our ``Tank.shoot`` method by checking ``this.shells >= 0`` instead of just ``this.shells > 0``. You'll also note that unlike Node's ``assert``, any ``console.log`` statements are *NOT* suppressed, which can be a boon (or curse) when debugging.

A simple fix to our ``Tank`` code like so:

<testing-with-platoon/tank.js>

And running our tests yields:

<pre>
Ka-Boom!
Ka-Boom!
Out of ammo!
TestTank
    <span style="color: #00FF00">(6/6) Make sure we can have a tank of our very own.</span>
    <span style="color: #00FF00">(4/4) Check that movement is working properly.</span>
    <span style="color: #00FF00">(6/6) Shoot the cannon!</span>
</pre>

Good job, soldier! We'll make a man (or woman) out of you yet!

## Communicating With HQ (Async Tests)

Better output & flexibility aren't the only reasons to use Platoon though. Platoon also makes it dead simple to test asynchronous operations. Simply wrap
asynchronous calls in ``assert.async`` and test the callback as normal. For example, we've got a ``Grenader`` that looks like:

<testing-with-platoon/grenader.js>

To test ``Grenader.throw``, we write tests like:

<testing-with-platoon/tests/test_grenader.js>

Our output (after 5 seconds) looks like:

<pre>
Fire in the hole!
TestGrenader
    <span style="color: #00FF00">(1/1) Throw the grenade and make sure it goes ka-boom.</span>
</pre>

Easy and ensures our callbacks are working correctly! If we keep up like this, the war will win itself!

## Fall In! (Multiple Tests & Building A Suite)

Last but not least, running each test by itself is as error-prone as handing a new recruit a loaded assault rifle, and almost as messy. Fortunately, building a suite is trivial. Inside our ``tests`` directory, drop in a ``tests.js`` that looks like:

<testing-with-platoon/tests/tests.js>

Now running the full suite is as simple as:

> platoon

You can run it like this from either within the ``tests`` directory as we have been, or up a directory alongside your application code. Running the suite this way generates the following output:

<pre>
Ka-Boom!
Ka-Boom!
Out of ammo!
Fire in the hole!
TestTank
    <span style="color: #00FF00">(6/6) Make sure we can have a tank of our very own.</span>
    <span style="color: #00FF00">(4/4) Check that movement is working properly.</span>
    <span style="color: #00FF00">(6/6) Shoot the cannon!</span>
TestGrenader
    <span style="color: #00FF00">(1/1) Throw the grenade and make sure it goes ka-boom.</span>
</pre>

## Join The Cadence (Conclusion)

    I don't know but I've been told,
    Testing with Platoon makes me bold!
    Red and green, refactor too,
    Runs my whole suite tried and true!
    
    All my tests, they end up green,
    See them in my terminal screen!
    Testing async is a gem,
    Never be without tests again!

Platoon is a fairly young project and there's plenty of room for features and improvement, but I find it's better for my workflow than the vanilla ``assert`` and hopefully you're inspired to give it a try. You who are about to test, we salute you!

*Disclaimer - I have no connections to the military, everything here was blatant stereotype, I don't endorse war machines of any type, please don't flame me, yada yada yada. If you didn't find the tone/wording humorous, sorry. Please mail a self-addressed envelope for a full refund. Offer void in Wyoming, Montana & Greenland.*
    