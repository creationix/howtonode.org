var sys = require('sys'),
    simple = require('./simplest-module-ever');

// This will throw an error!
sys.puts(simple.answer);