//root
app.get('/', function(req, res){
    articleProvider.findAll( function(error,docs){
        res.render('blog_index.jade', { locals: {
            title: 'Blog',
            articles:docs
            }
        });
    })
});

//css
get('/*.css', function(file){
  this.render(file + '.css.sass', { layout: false });
});

//blog
get('/blog/new', function(){
  this.render('blog_new.html.haml', {
    locals: {
      title: 'New Post'
    }
  });
});

post('/blog/new', function(){
  var self = this;
  articleProvider.save({
    title: this.param('title'),
    body: this.param('body')
  }, function(error, docs) {
    self.redirect('/')
  });
});
