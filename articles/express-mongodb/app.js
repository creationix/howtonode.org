var kiwi= require('kiwi')
kiwi.require('express');
kiwi.seed('mongodb-native')

require('express/plugins')
var ArticleProvider= require('./articleprovider-mongodb').ArticleProvider;

configure(function(){
  use(MethodOverride);
  use(ContentLength);
  use(Logger);
  set('root', __dirname);
})

var articleProvider= new ArticleProvider('localhost', 27017);

get('/', function(){
  var self = this;
  articleProvider.findAll(function(error, docs){
    self.render('blogs_index.html.haml', {
      locals: {
        title: 'Blog',
        articles: docs
      }
    });
  })
})

get('/*.css', function(file){
  this.render(file + '.css.sass', { layout: false });
});

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

run();
