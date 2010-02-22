Title: NodeJS for everyday things
Author: R. S. Doiel
Date: Fri Feb 19 2010 14:20:20 GMT-0800 (PST)

    
Everyday things:
> Those little programs you write quickly to get something done like counting pages in a text document.

## Page counting

Recently I was writing an essay and I needed to calculate a page count. My text editor was great at giving me a word count. I used the result and divided it by 350 to ball park my page count. This became problematic because I'm lousy at doing math in my head. Next I decided to chain some Unix commands together to do the job. I played with Bash, Unix's wc and cut commands I came up with this:

    #!sh
    #!/usr/bin/env bash
    let x=$(wc -w $1 | cut -d\  -f 1)/350
    echo "Page count for $1 is $x";

This was nice. It was short. It worked but I wanted to procrastinate a little more. I started thinking about the lack of nuance in this approach. What was wc really counting? How was it handling punctuation and new lines? I could have tracked down the source code for wc but that seemed a little excessive. I pondered on - process the file with sed before piping it to wc; wrap it in a function for processing multiple files; keep a running total and pipe stats into an SQLite database. I found myself running down the rabbit and out to the sea. It is truly impressive what you can conjure up from the Unix command line and build into a nice little complicated shell script. Sometimes it is easier to visualize something in one language. I thought of Node.

The page count problems are basically a simple analysis of text with some accounting. Could I quickly write a program using node to do something so mundane? Yes and it was surprisingly straight forward. I fired up node-repl and started playing around before typing up this:

    #!/usr/bin/env node
    /**
     * Calculate the approximate the number of "pages" in a text document based on
     * a word count of 350 words per page.
     */

    var sys = require('sys'),
        fs = require('fs');
        
    (function () {
      /* Include some instructions for when I forget how this works. */
      USAGE = function (message) {
        var error_code = 0;
        sys.puts("\n  USAGE: pagecount FILENAME\n" +
          "\n" + "  Show the estimated page count of a file based on 350 words per page.\n" +
          "  FILENAME should be the name of a utf-8 encoded text file.\n" +
          "\b\n  Example:\n\t\tpagecount MyFile.txt\n\n  Estimates the page count of MyFile.txt\n");

        if (message !== undefined) {
          sys.puts(message);
          error_code = 1;
        }
        process.exit(error_code);
      };

      if (process.argv.length < 3) {
        USAGE();
      }
      
      /* PageCount() analyze the file and displays the results */
      PageCount = function (filename) {
        fs.stat(filename, function (stat_error, stat) {
          if (stat_error) {
            USAGE("ERROR: " + filename + ", " + stat_error);
          }
          
          if (stat.isFile()) {
            fs.readFile(filename, 'utf8', function (read_error, content) {
              var subtotal_words = 0;
              if (read_error) {
                USAGE("ERROR: Can't read " + filename + ". " + read_error);        
              }
              /* Replace all non-letter characters with a single space. */
              subtotal_words = content.replace(/\W+|\s+/gm,' ').split(' ').length;
              page_count = (subtotal_words/350);
              if (Number(page_count).toFixed(0) <= 1) {
                sys.puts(filename + "(" + subtotal_words + " words): " + 
                  Number(page_count * 100).toFixed(0) + "% of one page.");
              } else {
                sys.puts(filename + "(" + subtotal_words + " words):" + 
                  Number(page_count).toFixed(2) + " pages.");
              }
            });
          } else {
            USAGE("ERROR: " + filename + " is not a file.");
          }
        });
      };
      
      /* For each file I want to tally up call PageCount() */
      for (var i = 2; i < process.argv.length; i += 1) {
        PageCount(process.argv[i]);
      }
    })();

`pagecount` reports the plain text version of this essay is 636 words or 1.82 pages including the source code examples. It's a little longer than my shell script. On the other hand it is easier to read and with a little modification I can embed it as a web service or put it into a web page.

