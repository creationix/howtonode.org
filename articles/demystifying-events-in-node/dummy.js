// basic imports
var sys = require('sys');
var events = require('events');

// for us to do a require later
exports.Dummy = Dummy;

function Dummy() {
    var self = this;
    events.EventEmitter.call(self);
}

sys.inherits(Dummy, events.EventEmitter);