/**
 * Module dependencies.
 */

var express = require('express');
var ArticleProvider = require('./articleprovider-mongodb').ArticleProvider;


var app = module.exports = express.createServer();

// Configuration

app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(require('stylus').middleware({ src: __dirname + '/public' }));
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));
});

app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true })); 
});

app.configure('production', function(){
  app.use(express.errorHandler()); 
});

var articleProvider = new ArticleProvider('localhost', 27017);
// Routes

app.get('/', function(req, res){
    articleProvider.findAll( function(error,docs){
        res.render('index.jade', { 
            locals: {
                title: 'Blog',
                articles:docs
            }
        });
    })
});

app.get('/blog/new', function(req, res) {
    res.render('blog_new.jade', { locals: {
        title: 'New Post'
    }
    });
});

app.post('/blog/new', function(req, res){
    articleProvider.save({
        title: req.param('title'),
        body: req.param('body')
    }, function( error, docs) {
        res.redirect('/')
    });
});

app.get('/blog/:id', function(req, res) {
    articleProvider.findById(req.params.id, function(error, article) {
        res.render('blog_show.jade',
        { locals: {
            title: article.title,
            article:article
        }
        });
    });
});

app.post('/blog/addComment', function(req, res) {
    articleProvider.addCommentToArticle(req.param('_id'), {
        person: req.param('person'),
        comment: req.param('comment'),
        created_at: new Date()
       } , function( error, docs) {
           res.redirect('/blog/' + req.param('_id'))
       });
});

app.listen(3000);
console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
