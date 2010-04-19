#!/usr/bin/env node
// This runs a standalone server using the Wheat blogging system.
// You will need to install it from http://github.com/creationix/wheat

var Wheat = require('wheat');
var sys = require('sys');
var path = __dirname;
var port = 8080;
var host = "127.0.0.1";
sys.error("Starting wheat server using git repo at " + path);
Wheat(path, port, host);