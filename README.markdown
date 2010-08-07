# HowToNode.org

This is a community supported blog about how to program in nodejs.

This is powered by a new static blog engine written in node called [wheat][].

To run a local version of the blog, simply install [wheat][] and it's dependencies, node.JS v0.1.101 or later.

If you have [spark][] installed, just type `spark` in this directory.  If not, append `.listen(3000)` right before the closing semicolon and run it with `node app.js`

You can get a working wheat environment out of the box with [ivy][].

[wheat]: http://github.com/creationix/wheat
[ivy]: http://github.com/creationix/ivy
[spark]: http://github.com/senchalabs/spark

## Contributing

The best way to contribute is to fork this repository and add your article.  If this is your first article, then please add an entry for yourself in the authors directory as well.

### Article format

Every article is a markdown file with some meta-data at the top of the file.

    Title: Control Flow in Node Part II
    Author: Tim Caswell
    Date: Thu Feb 04 2010 02:24:35 GMT-0600 (CST)
    Node: v0.1.91

    I had so much fun writing the last article on control flow, that I decided to...

    ## First section: Display JavaScript files
    
    * display contents of external JavaScript file (path is relative to .markdown file)
    <test-code/test-file.js>

    * display contents of external JavaScript file and evaluate its contents 
    <test-code/evaluate-file.js*>

    More content goes here.

More docs to come soon...

## Licensing

All articles are copyright to the individual authors.  Authors can put notes about license and copyright on their individual bio pages if they wish.