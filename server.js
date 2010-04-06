#!/usr/bin/env node
// This runs a standalone server using the Wheat blogging system.
// You will need to install it from http://github.com/creationix/wheat

var Wheat = require('wheat');
Wheat(__dirname, 8080);