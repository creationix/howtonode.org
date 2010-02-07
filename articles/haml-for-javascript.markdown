Title: Using HAML templates in JavaScript
Author: Tim Caswell
Date: Sat Feb 06 2010 20:11:14 GMT-0600 (CST)

One of my favorite libraries when I was doing [ruby][] development was the HTML templating language [HAML][].  For those of you who haven't yet been enlightened, it's an alternate syntax for XML that results in a **lot** less code to write the same thing.

When I switched to primarily JavaScript, I missed HAML so much I wrote two ports of it.  One is called [jquery-haml][].  It's a dom-building library with some really advanced DOM integration tricks.  The other is [haml-js][].  It's a text-to-text compiler that translates HTML code to HTML, perfect for node based websites.

## Using `haml-js` in a node website ##

Using [haml-js][] is pretty straight-forward.  First, you install `haml-js` as a library for use in node.  The full docs are [here][], but I'll show how I set up my node libraries.

### Installing `haml-js` in node ###

There isn't really a standard package manager in node, but it's not hard to install a package once you've done it a time or two.  I like to use git for all GitHub based libraries so that I can update any library by issuing a pull command.

    #!sh
    tim@TimBook:~$ mkdir Code
    tim@TimBook:~$ cd Code/
    tim@TimBook:~/Code$ git clone git://github.com/creationix/haml-js.git
    Initialized empty Git repository in /Users/tim/Code/haml-js/.git/
    remote: Counting objects: 311, done.
    remote: Compressing objects: 100% (278/278), done.
    remote: Total 311 (delta 161), reused 0 (delta 0)
    Receiving objects: 100% (311/311), 47.73 KiB, done.
    Resolving deltas: 100% (161/161), done.
    tim@TimBook:~$ mkdir ~/.node_libraries
    tim@TimBook:~$ cd ~/.node_libraries
    tim@TimBook:~/.node_libraries$ ln -s ~/Code/haml-js/lib/* ./

Basically I made a folder for code clones, another one for node libraries, and linked the two up so node can find the code.

After you've done this once, you can skip the `mkdir` commands on your next library install.

## Checking the install ##

Open up a `node-repl` session and see if you can import my library.

    #!sh
    tim@TimBook:~$ node-repl
    Welcome to the Node.js REPL.
    Enter ECMAScript at the prompt.
    node> var Haml = require('haml');
    {
     "compile": [Function],
     "optimize": [Function],
     "render": [Function],
     "execute": [Function]
    }
    node> Haml.render('.classy Hello World')
    "<div class=\"classy\">Hello World\n</div>"

Great, it's working!  If this is not working for you, the [node mailing list][] is a really friendly place if you need help getting this setup.

## A simple HAML based site

As you saw in the last section, you can test it from a `node-repl` session, but let's make a whole program with partials, loops and conditionals just for fun.

### Layout template

First let's make our layout template, we'll save it as `layout.haml`:

    #!haml
    !!! Strict
    %html(lang="en")
      %head
        %title&= title
      %body
        = contents

### Start of Program

Now we'll write a short node program to render it:

    var Haml = require('haml'),
        File = require('file'),
        sys = require('sys');

    File.read('layout.haml').addCallback(function (haml) {
      var data = {
        title: "Hello Node",
        contents: "<h1>Hello World</h1>"
      };
      var html = Haml.render(haml, {locals: data});
      sys.puts(html);
    });

This program will output:

    #!html
    <!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">
    <html lang="en"><head><title>Hello Node
    </title></head><body><h1>Hello World</h1>
    </body></html>

### Subpage

Usually you'll want another template for your actual pages and just share the common layout between them.   So we'll make an actual page with a little logic in it and save it as `users.haml`.

    #!haml
    %h1 Users
    :if users.length === 0
      %p There are no users in the system.
    :if users.length > 0
      %ul
        :each user in users
          %li&= user

There are two branches in this template.  If the users list is empty, then a static message will be shown; if not, then each user will be shown as a list item.

Here is how we modify the code to use this page:

    File.read('layout.haml').addCallback(function (layout_haml) {
      File.read('users.haml').addCallback(function (users_haml) {
        var data = {
          users: ["Tim", "Sally", "George", "James"]
        };
        var page_data = {
          title: "System Users",
          contents: Haml.render(users_haml, {locals: data})
        };
        var html = Haml.render(layout_haml, {locals: page_data});
        sys.puts(html);
      });
    });

And here is the output:

    #!html
    <!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">
    <html lang="en"><head><title>System Users
    </title></head><body><h1>Users
    </h1><ul><li>Tim
    </li><li>Sally
    </li><li>George
    </li><li>James
    </li></ul>
    </body></html>

### Partials

Ok, now that we know how to make layout templates by passing the result of one template as a variable to another, let's learn how to do partials.  Partials are pieces of templates that are shared between several pages.

Here is the data we want to render:

    var links = [
      {name: "Google", link: "http://google.com/"},
      {name: "Github", link: "http://github.com/"},
      {name: "nodejs", link: "http://nodejs.org/"},
      {name: "HowToNode.org", link: "http://howtonode.org/"}
    ];

First we'll make a partial to render each link by itself and save it as `link.haml`:

    #!haml
    %li
      %a{href: link}&= name

Then we'll make a page to render the links and save it as `links.haml`:

    #!haml
    %h1 Links
    %ul
      :each link in links
        = partial("link", link)

Since partials aren't built into [haml-js][], then we'll have to implement it in our framework.  But don't worry, it's not hard.

We're starting to nest pretty deeply, so we'll shift to parallel file loading for the template sources.  We'll pre-compile the templates while we're at it:

    var template_names = ["layout", "link", "links"];
    var counter = template_names.length;
    var templates = {};
    template_names.forEach(function (name) {
      File.read(name + ".haml").addCallback(function (text) {
        templates[name] = Haml.compile(text);
        counter--;
        if (counter <= 0) {
          render_page();
        }
      });
    });

Now we can make a render function that knows how to load the saved, compiled templates:

    function render(name, locals) {
      return Haml.execute(templates[name], null, locals);
    }

We're all set to define the `render_page` function referenced in the parallel loading part:

    function render_page() {
      var html = render("layout", {
        title: "Links",
        contents: render("links", {
          partial: render,
          links: links
        })
      })
      sys.puts(html);
    }

### Source Code

You can find the [source code][] of the code in these examples on GitHub.

Also, this blog itself is powered by `haml-js`.  You can see the [templates here][] and the [engine here][].

## Using jquery-haml

My other HAML project, [jquery-haml][], is a different beast altogether.  Instead of parsing real HAML syntax and generating HTML text, it takes a JSON structure and dom-builds from it.  There is nothing stopping you from using the text-to-text `haml-js` in a browser and inserting it into the DOM using `innerHTML`, but you can't get at the nodes as they're created because it's all done behind closed doors by the browser.

Here is a simple example of the `jquery-haml` syntax:

    [".profile",
      [".left.column",
        ["#date", print_date() ],
        ["#address", curent_user.address ]
      ],
      [".right.column",
        ["#email", current_user.email ],
        ["#bio", current_user.bio ]
      ]
    ]

There is nothing special here except we've taken the HAML syntax and fit it into proper JSON syntax.

How about this example:

    ["%div", {style: "width:260px; margin:15px;", $:{
      slider: [{value: 60}]
    }}]

This creates a div element, sets the style on it, and then calls `$.fn.slider` on it!  We didn't have to give it a unique id and then search for it later with something like `$("#my_id").slider({value: 60})`, the dom-builder library did it for us right after creating the node.

A full depth tutorial on this library could go on for pages, but this should be enough to whet your appetite.  See the source of the [sample page][] for some more ideas.  But since this is more of an easy macro system for programmatically dom-building, then you have full control over every step.  I've written entire apps using just nested `jquery-haml` expressions and closures for data storage.

[templates here]: http://github.com/creationix/howtonode.org/tree/master/skin/
[engine here]: http://github.com/creationix/node-blog/blob/master/build.js
[sample page]: http://static.creationix.com/jquery-haml/examples
[source code]: http://github.com/creationix/howtonode.org/tree/master/articles/haml-for-javascript/
[node mailing list]: http://groups.google.com/group/nodejs
[here]: http://nodejs.org/api.html#_modules
[ruby]: http://ruby-lang.org/
[HAML]: http://haml-lang.com/
[jquery-haml]: http://github.com/creationix/jquery-haml
[haml-js]: http://github.com/creationix/haml-js