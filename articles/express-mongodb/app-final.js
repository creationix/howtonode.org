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

//getRoot
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

//getCss
get('/*.css', function(file){
  this.render(file + '.css.sass', { layout: false });
});

//getBlogs
get('/blog/*', function(id){
  var self = this;
  articleProvider.findById(id, function(error, article) {
    self.render('blog_show.html.haml', {
      locals: {
        title: article.title,
        article:article
      }
    });
  });
});

//addNewBlog

get('/blog/new', function(){
  this.render('blog_new.html.haml', {
    locals: {
      title: 'New Post'
    }
  });
});

//addComment

post('/blog/addComment', function() {
  var self = this;
  articleProvider.addCommentToArticle(this.param('_id'), {
    person: self.param('person'),
    comment: self.param('comment'),
    created_at: new Date()
  }, function(error, docs) {
    self.redirect('/blog/' + self.param('_id'))
  });
});

//postNewBlog

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