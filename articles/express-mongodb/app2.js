//root
app.get('/', function(req, res){
    articleProvider.findAll( function(error,docs){
        res.render('blogs_index.jade', { locals: {
            title: 'Blog',
            articles:docs
            }
        });
    })
});

//blog
app.get('/blog/new', function(req, res) {
    res.render('blog_new.jade', { locals: {
        title: 'New Post'
    }
    });
});

app.post('/blog/new', function(req, res){
    articles.save({
        title: req.param('title'),
        body: req.param('body')
    }, function( error, docs) {
        res.redirect('/')
    });
});
