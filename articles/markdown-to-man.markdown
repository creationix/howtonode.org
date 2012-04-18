Title:  Markdown To Man
Author: Scott Elcomb
Date: Thu Nov 25 16:24:41 EST 2010
Node: v0.2.5

In this article we'll look at a quick and dirty solution for reading Node.js module documentation (and other Markdown formatted files) with man.

## Reading Node.js Module Documentation With Man

As a new Node.js user one of the first issues I've come across is related to documentation.  Not an issue really, but a bit of an annoyance.

Markdown is great, but I like man pages.  Here's a quick solution I found to view Markdown files as man pages...

## Dependencies

First grab a copy of Pandoc from http://johnmacfarlane.net/pandoc/

Or, if your system uses apt (debian/ubuntu) try:

    sudo apt-get install pandoc

## The nodedoc command

Next, create a file called nodedoc somewhere on your path.  I'm using ~/bin/nodedoc:

    #!/bin/sh
    if [ -e $1 ]; then
        /usr/bin/pandoc -s -t man $1 | man -l -
    else
        echo "not found"
    fi

Make sure it's executable:

    chmod u+x ~/bin/nodedoc

You can name this script something else if you wish; nodedoc just seemed like a good name.

## Use it

Assuming you're using npm and that your Node.js modules are installed in /usr/local/lib/node/ you can try it with:

    nodedoc /usr/local/lib/node/.npm/npm/active/package/README.md

or, if you're already in that directory:

    nodedoc README.md

That's all there is to it!
