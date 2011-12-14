var couchdb = require('couchdb')
  , settings = require('../settings');

var client  = couchdb.createClient(settings.port, settings.host, { user: settings.user, password: settings.password });
var db      = client.db(settings.db);

var designDoc = {
  _id: '_design/blog',

  language: 'javascript',

  views: {
    'posts_by_date': {
      map: function(doc) {
        if (doc.type === 'post') {
          emit(doc.postedAt, doc);
        }
      }.toString()
    }
  }
};

db.saveDoc(designDoc).then(function(resp) {
  console.log('updated design doc!');
}, function(err) {
  console.log('error updating design doc: '+require('util').inspect(err));
});
