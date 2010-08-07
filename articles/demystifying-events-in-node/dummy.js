// basic imports
var events = require('events');

// for us to do a require later
module.exports = Dummy;

function Dummy() {
    events.EventEmitter.call(this);
}

// inherit events.EventEmitter
Dummy.super_ = events.EventEmitter;
Dummy.prototype = Object.create(events.EventEmitter.prototype, {
    constructor: {
        value: Dummy,
        enumerable: false
    }
});