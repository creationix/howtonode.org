var couchdb = require('couchdb');
var client  = couchdb.createClient(5984, '127.0.0.1', { user: 'nathan', password: 's4stott' });
var db      = client.db('blog');

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
