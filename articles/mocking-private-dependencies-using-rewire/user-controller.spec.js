'use strict';

var sinon = require('sinon'),
    rewire = require('rewire'),
    userController = rewire('./user-controller');

describe('allUsers', function() {

  it ('should return all users',function() {

    // given
    var userServiceMock = {},
        res             = { json: sinon.spy()},
        users           = [{id: 'user1'}, {id: 'user2'}],
        nextStub        = sinon.stub();

    // and
    userServiceMock.getUser = sinon.stub().callsArgWith(1, null, users);

    // when
    userController.allUsers({}, res, nextStub);

    // then
    res.json.calledWith(users).should.equal(true);
    nextStub.called.should.equal(false);
  });
});