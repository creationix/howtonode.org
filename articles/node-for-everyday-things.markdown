Title: NodeJS for everyday things
Author: R. S. Doiel
Date: Fri Feb 19 2010 14:20:20 GMT-0800 (PST)
Node: v0.1.91

Everyday things:
> Those little programs you write quickly to get something done like counting pages in a text document.

## Page counting

Recently I was writing an essay and I needed to calculate a page count. My text editor was great at giving me a word count. I used the result and divided it by 350 to ball park my page count. This became problematic because I'm lousy at doing math in my head. Next I decided to chain some Unix commands together to do the job. I played with Bash, Unix's wc and cut commands I came up with this:

    #!/usr/bin/env bash
    let x=$(wc -w $1 | cut -d\  -f 1)/350
    echo "Page count for $1 is $x";

This was nice. It was short. It worked but I wanted to procrastinate a little more. I started thinking about the lack of nuance in this approach. What was wc really counting? How was it handling punctuation and new lines? I could have tracked down the source code for wc but that seemed a little excessive. I pondered on - process the file with sed before piping it to wc; wrap it in a function for processing multiple files; keep a running total and pipe stats into an SQLite database. I found myself running down the rabbit and out to the sea. It is truly impressive what you can conjure up from the Unix command line and build into a nice little complicated shell script. Sometimes it is easier to visualize something in one language. I thought of Node.

The page count problems are basically a simple analysis of text with some accounting. Could I quickly write a program using node to do something so mundane? Yes and it was surprisingly straight forward. I fired up node-repl and started playing around before typing up this:

<node-for-everyday-things/word-count.js*>


`pagecount` reports the plain text version of this essay is 636 words or 1.82 pages including the source code examples. It's a little longer than my shell script. On the other hand it is easier to read and with a little modification I can embed it as a web service or put it into a web page.

