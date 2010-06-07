var Connect = require('connect');

Connect.createServer([
    {module: {handle: function (err, req, res, next) {
        // Every request gets the same "Hello Connect" response.
        res.simpleBody(200, "Hello Connect");
    }}}
]).listen(8080);