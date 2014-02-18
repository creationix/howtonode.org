'use strict';

var userService = require('../service/user-service');

exports.allUsers = function (req, res, next) {

  userService.getUsers(function (err, users) {
    if (err) {
      return next(err);
    }
    res.json(users);
  });
};