var couchdb = require('node-couchdb'),
    client = couchdb.createClient();

client.request('put', '/shout');

client.db('shout').saveDesign('shout', {
    views: {
        all: {
            map: function(doc) {
                emit(null, doc);
            }
        }
    }
});
