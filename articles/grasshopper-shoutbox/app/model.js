var gh = require('grasshopper'),
    crypto = require('crypto');

function Shout() {
}

exports.Shout = gh.initModel(Shout, 'name', 'email', 'message');

Shout.prototype.validate = function() {
    this.validateRequired('name', 'Name is required.', false);
    this.validateRequired('email', 'Email is required.', false);
    this.validateRequired('message', 'Message is required.', false);
};

Shout.prototype.mailHash = function() {
    return crypto.createHash('md5').update(this.email()).digest('hex');
};

