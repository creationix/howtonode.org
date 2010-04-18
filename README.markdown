# HowToNode.org

This is a community supported blog about how to program in nodejs.

This is powered by a new static blog engine written in node called [wheat][].

To run a local version of the blog, simply install [wheat][], node.JS v0.1.33-205-g2ff20d8 or later and then run the included `server.js` script.

[wheat]: http://github.com/creationix/wheat

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