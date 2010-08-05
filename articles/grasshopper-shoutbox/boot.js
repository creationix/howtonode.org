var gh = require('grasshopper');

gh.configure({
    layout: 'views/layout',
    viewsDir: 'views'
});

require('./app/controller');

gh.serve(8080);
