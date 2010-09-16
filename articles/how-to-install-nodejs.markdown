Title: How to Install Node.js
Author: Node Knockout
Date: Sat, 11 Sep 2010 22:40:19 GMT
Node: v0.2.1

This was the first in a series of posts leading up to
[Node.js Knockout][] on how to use [node.js][].

I have been given permission to repost the articles from the contest here (in wheat format) for general consumption.  Expect more to come.

In this post we detail how to install node on [Mac][], [Ubuntu][],
and [Windows][].

## Mac

If you're using the excellent [homebrew][] package manager, you can
install node with one command: `brew install node`.

Otherwise, follow the below steps:

1.  [Install Xcode][].
2.  [Install git][].
3.  Run the following commands:

<how-to-install-nodejs/darwin_setup.sh>

You can check it worked with a simple [Hello, World!][] example.

## Ubuntu

1.  Install the dependencies:
    -   `sudo apt-get install g++ curl libssl-dev apache2-utils`
    -   `sudo apt-get install git-core`

2.  Run the following commands:

<how-to-install-nodejs/ubuntu_setup.sh>

You can check it worked with a simple [Hello, World!][] example.

Thanks to [code-diesel][] for the Ubuntu dependencies.

## Windows

Currently, you must use [cygwin][] to install node. To do so,
follow these steps:

1.  [Install cygwin][].
2.  Use `setup.exe` in the cygwin folder to install the following
    packages:
    -   devel &rarr; openssl
    -   devel &rarr; g++-gcc
    -   devel &rarr; make
    -   python &rarr; python
    -   devel &rarr; git

3.  Open the cygwin command line with
    `Start > Cygwin > Cygwin Bash Shell`.
4.  Run the below commands to download and build node.

<how-to-install-nodejs/cygwin_setup.sh>

For more details, including information on troubleshooting, please
see the [GitHub wiki page][].

## Hello Node.js!

Here's a quick program to make sure everything is up and running
correctly:

<how-to-install-nodejs/hello_node.js>

Run the code with the `node` command line utility:

    > node hello_node.js
    Server running at http://127.0.0.1:8124/


Now, if you navigate to [http://127.0.0.1:8124/][] in your browser,
you should see a nice message.

## Congrats!

You've installed [node.js][].

  [Countdown to Knockout: Post 1 - How to Install Node.js]: http://nodeknockout.posterous.com/countdown-to-knockout-post-1-how-to-install-n
  [Node.js Knockout]: http://nodeknockout.com/
  [node.js]: http://nodejs.org/
  [Mac]: #mac
  [Ubuntu]: #ubuntu
  [Windows]: #windows
  [homebrew]: http://github.com/mxcl/homebrew
  [Install Xcode]: http://developer.apple.com/technologies/tools/
  [Install git]: http://help.github.com/mac-git-installation/
  [Hello, World!]: #hello
  [code-diesel]: http://www.codediesel.com/linux/installing-node-js-on-ubuntu-10-04/
  [cygwin]: http://www.cygwin.com/
  [Install cygwin]: http://www.mcclean-cooper.com/valentino/cygwin_install/
  [GitHub wiki page]: http://wiki.github.com/ry/node/building-node-on-windowscygwin
  [http://127.0.0.1:8124/]: http://127.0.0.1:8124/