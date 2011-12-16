var bogart  = require('bogart')
  , couchdb = require('couchdb')
  , settings = require('./settings');

var client     = couchdb.createClient(settings.port, settings.host, { user: settings.user, password: settings.password })
  , db         = client.db(settings.db)
  , viewEngine = bogart.viewEngine('mustache')
  , router     = bogart.router();

router.get('/', function(req) {
  return bogart.redirect('/posts');
});

router.get('/posts', function(req) {
    
  return db.view('blog', 'posts_by_date').then(function(resp) {
    var posts = resp.rows.map(function(x) { return x.value; });
    
    return viewEngine.respond('posts.html', {
      locals: {
        posts: posts,
        title: 'Blog Home'
      }
    });
  }, function(err) {
    if (err.error && err.error === 'not_found') {
      return bogart.error('execute syncDesignDoc before trying to use the blog');
    }
    throw err;
  });
});

router.get('/posts/new', function(req) {
  return viewEngine.respond('new-post.html', {
    locals: {
      title: 'New Post'
    }
  });
});
  
router.post('/posts', function(req) {
  var post = req.params;
  post.type = 'post';
  post.postedAt = new Date();

  return db.saveDoc(post).then(function(resp) {
    return bogart.redirect('/posts');
  });
});

router.get('/posts/:id', function(req) {
  return db.openDoc(req.params.id).then(function(post) {
    return viewEngine.respond('post.html', { locals: post });
  });
});

router.post('/posts/:id/comments', function(req) {
  var comment = req.params;

  return db.openDoc(req.params.id).then(function(post) {
    post.comments = post.comments || [];
    post.comments.push(comment);

    return db.saveDoc(post).then(function(resp) {
      return bogart.redirect('/posts/'+req.params.id);
    });
  });
});

var app = bogart.app();

// Include batteries, a default JSGI stack.
app.use(bogart.batteries);

// Include our router, it is significant that this is included after batteries.
app.use(router);

app.start();
