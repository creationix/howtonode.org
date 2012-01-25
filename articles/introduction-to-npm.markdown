Title: Introduction to npm
Author: Isaac Z. Schlueter
Date: Sat, 11 Sep 2010 23:05:24 GMT
Node: v0.2.1

This was the third in a series of posts leading up to
[Node.js Knockout][] on how to use [node.js][].

npm is a [NodeJS][node.js] package manager. As its name would
imply, you can use it to install node programs. Also, if you use it
in development, it makes it easier to specify and link
dependencies.

## Installing npm

First of all, install [NodeJS][node.js]. Like so much of the NodeJS
ecosystem, npm is very young, so you’ll generally have to use a
very recent version of node in order to use it. At the time of
writing this, that means at least version 0.1.103.

To install npm in one command, you can do this:

    curl http://npmjs.org/install.sh | sh

Of course, if you’re more paranoid than lazy, you can also get the
[latest code][], check it all out, and when you’re happy there’s
nothing in there to pwn your machine, issue a `make install` or
`make dev`.

## what, no sudo?

**I strongly encourage you not to do package management with sudo!**
Packages can run arbitrary scripts, which makes sudoing a package
manager command as safe as a chainsaw haircut. Sure, it’s fast and
definitely going to cut through any obstacles, but you might
actually *want* that obstacle to stay there.

I recommend doing this once instead:

    sudo chown -R $USER /usr/local

That sets your user account as the owner of the `/usr/local`
directory, so that you can just issue normal commands in there.
Then you won’t ever have to use sudo when you install node or issue
npm commands.

It’s much better this way. `/usr/local` is *supposed* to be the
stuff you installed, after all.

`</rant>`

## Getting help: `npm help`

npm has a lot of help documentation about all of its commands. The
`npm help` command is your best friend. You can also tack `--help`
onto any npm command to get help on that one command.

## Installing stuff: `npm install`

You probably got npm because you want to install stuff. That’s what
package managers do, they install stuff.

`npm install blerg` installs the latest version of `blerg`. You can
also give `install` a tarball, a folder, or a url to a tarball. If
you run `npm install` without any arguments, it tries to install
the current folder.

This command can do a lot of stuff. `npm help install` will tell
you more than you ever wanted to know about it.

## Showing things: `npm ls`

The `npm ls` command shows what’s on your system, and also what’s
available in the registry. The arguments are beautifully colored
greps. For instance `npm ls installed` would show you what’s
installed on your system. `npm ls installed marak` would show you
all the packages installed on your system created by [Marak][].

`npm help ls` for more info.

## Updating packages: `npm update`

The `update` command does a few things.

1.  Search the registry for new versions of all the packages
    installed.
2.  If there’s a newer version, then install it.
3.  Point dependent packages at the new version, if it satisfies
    their dependency.
4.  Remove the old versions, if no other package names them as a
    dependency.

So basically, update behaves a lot like a “standard” package
manager’s update command, except that it also checks to make sure
that the new version isn’t going to break anything before it points
stuff at it.

You see, npm keeps you out of dependency hell.

## Development: `npm link`

The link command symlinks a package folder into your system, so
that changes are automatically reflected. It also installs the
`"dependencies"` and `"devDependencies"` packages from your
package.json file.

This is one of the most useful tools for developing programs with
node. Give your thing a name and a version in a `package.json`
file. Specify a few dependencies and a `main` module. Then run
`npm link`, and go to town coding it and testing it out in the node
repl. It’s great.

npm is a development tool, first and foremost. People sometimes say
"Yeah, I haven’t gotten time to check out that package manager
stuff yet. Maybe I will when my code is more stable."

That’s like saying that you’re going to start using source control
when your code is done. It’s just silly. Source control should make
your process *easier*, and if it doesn’t, then you’re using a
broken SCM. Same for package management. It should make it easier,
and if it doesn’t, then something is wrong.

npm isn’t “for” publishing. That’s just something it can do. It’s
"for" playing. That’s why I wrote it: to play with your code,
without having to remember a dozen different ways to install your
stuff, or having to get you all to structure your code the same
way.

It’s *supposed* to make the process funner.

## Making a Package: The `package.json` file.

The `package.json` file goes in the root of your package. It tells
npm how your package is structured, and what to do to install it.

Most of the time, you only need the `"name"`, `"version"`, and
`"main"` fields (even for node-waf compiled addons).

If you don’t know [json][], then it’s about time you learn it. It’s
pretty easy.

Use `npm help json` to learn which fields npm cares about.
Basically, it’s as simple as putting the package.json file in the
root of your project, and then telling it how to get to your code.

Seriously. It’s incredibly easy. If you disagree, please
[let me know][].

## Acquiring Fame: `npm publish`

So, you created a package, and you can install it. Now you want the
everlasting fame and glory that comes with other people using your
code. There is no better way to ensure your immortality than
eventually being a part of every web app out there, and the
best—nay, the ONLY—way to truly accomplish this is to publish
nodejs packages.

First, create a user account with `npm adduser`. Give it a
username, password, and email address, and it’ll create an account
on the npm registry. (You can also use adduser to authorize a user
account on a new machine, or fix the situation if you break your
configs.)

Next, go to the root of your package code, and do `npm publish`.

Bam. Done.

Now go to the mailing list and tell everyone how much more awesome
they'd be if they used your program.

## Dependency Hell Isn’t Fun

Most systems have a single root namespace. That kind of sucks. If
two different things depend on different versions of the same
dependency, then you’ve got two options:

1.  Statically compile the dependency into the program.
2.  Hate life.

Option \#2 is Not Fun. So eff that noise. That sucks, and is dumb.

Option \#1 is less than ideal if you want to be able to abstract
out parts of your program and benefit from updates to the
dependencies.

Thankfully, unlike most programming environments, the CommonJS
Securable Module system lets you avoid dependency hell by modifying
the `require.paths` at runtime, so that each package sees the
version that it depends on.

I think that’s pretty cool.

## What to do when npm lets you down

npm’s pretty young software, and still being actively developed.
Especially if you find yourself using some newer features,
occasionally npm will have a bug. Or, perhaps equally likely,
you’ll need npm to do something that it doesn’t yet do, and want to
request a feature.

You can post bugs and feature requests on [the issues page][]. If
you want to ask general questions, you can ask on
[the google group][].

Or, if you’re more the instant gratification type, you can come ask
questions in IRC on [the #node.js channel on freenode.net][]. If
I’m there, I’ll try to help you out, but this community continues
to impress me with its helpfulness. Noders rock!

  [Countdown to Knockout: Post 3 - Introduction to npm]: http://nodeknockout.posterous.com/countdown-to-knockout-post-3-introduction-to
  [Node.js Knockout]: http://nodeknockout.com/
  [node.js]: http://nodejs.org/
  [npm]: http://npmjs.org
  [Node.js Knockout judge]: http://nodeknockout.com/judging#isaac_schlueter
  [latest code]: http://github.com/isaacs/npm
  [Marak]: http://jimbastard.com/
  [json]: http://json.org/
  [let me know]: mailto:i@izs.me
  [the issues page]: http://github.com/isaacs/npm/issues
  [the google group]: http://groups.google.com/group/npm-
  [the #node.js channel on freenode.net]: irc://irc.freenode.net/#node.js