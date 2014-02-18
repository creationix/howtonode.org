Title: Mocking Dependencies using [rewire]
Author: Caroline BDA
Date: Mon Feb 17 2014 23:05:41 GMT-0800 (PST)
Node: v0.10.25


Despite all my efforts to try to encapsulate some of my code into my modules, I was always founding myself exposing too much just for unit testing purpose. And even thought, it was often very complex to mock out some of the external libraries I was using.
That was before I found the [rewire] library.
As they say it only: "adds a special setter and getter to modules so you can modify their behaviour for better unit testing".

This is all what you need!


### Let's see an example

I have a very simple controller like this:

<mocking-private-dependencies-using-rewire/user-controller.js>

In my test driven development all I want to test is:
- this method will call `getUsers` on `userService`
- if the callback receive an error then it will call `next` passing the error
- else `json` is called on the response with the users as arguments

**Setting up a mock is easy** (I use [sinon] but any mocking will do it):

    // given
    var userController = require('./user-controller'),
        userServiceMock = {};

    // and
    userServiceMock.getUser = sinon.stub().callsArgWith(1, null, [{id: 'user1'}, {id: 'user2'}]);

    // when
    userController.allUsers();

    // then
    userServiceMock.getUser.calledOnce.should.equal(true);

But how can I **inject the mock instead of the real user service** ?

=> **Rewire**!

Instead of require the user-controller I'm using rewire:

    var userController = rewire('./user-controller')

Then I can get and set any properties on the module. So I can do:

    before(function(){
        userController.__set__({
            'userService': userServiceMock
        });
    });

Et voila!

Here is the full test for the previous controller:
<mocking-private-dependencies-using-rewire/user-controller.spec.js>


[rewire]: https://npmjs.org/package/rewire/
[sinon]: https://npmjs.org/package/sinon/
