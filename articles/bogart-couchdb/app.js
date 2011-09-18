var bogart  = require('bogart');
var couchdb = require('couchdb');

var app = bogart.router(function(get, post, put, destroy) {

  var client     = couchdb.createClient(5984, '127.0.0.1', { user: 'nathan', password: 's4stott' })
    , db         = client.db('blog')
    , viewEngine = bogart.viewEngine('mustache');

  get('/posts', function(req) {
    
    return db.view('blog', 'posts_by_date').then(function(resp) {
      var posts = resp.rows.map(function(x) { return x.value; });
      
      return viewEngine.respond('posts.html', {
        locals: {
          posts: posts,
          title: 'Blog Home'
        }
      });
    });
  });

  get('/posts/new', function(req) {
    return viewEngine.respond('new-post.html', {
      locals: {
        title: 'New Post'
      }
    });
  });
  
  post('/posts', function(req) {
    var post = req.params;
    post.type = 'post';

    return db.saveDoc(post).then(function(resp) {
      return bogart.redirect('/posts');
    });
  });

  get('/posts/:id', function(req) {
    return db.openDoc(req.params.id).then(function(post) {
      return viewEngine.respond('post.html', { locals: post });
    });
  });

  post('/posts/:id/comments', function(req) {
    var comment = req.params;

    return db.openDoc(req.params.id).then(function(post) {
      post.comments = post.comments || [];
      post.comments.push(comment);

      return db.saveDoc(post).then(function(resp) {
        return bogart.redirect('/posts/'+req.params.id);
      });
    });
  });
});

// Add ParseForm middleware to automatically process the parameters
// of form submissions into a JSON object that is easily usable (req.body, req.params).
app = bogart.middleware.ParseForm(app);

// Start the JSGI server.
bogart.start(app);