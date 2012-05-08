Title: Deploying to Heroku
Author: Heorku Docs
Date: Wed Sep 29, 2010 12:10:14 GMT-0700 (PDT)

## Getting on the Heroku node.js beta

As a contestant in Node.js Knockout, you should have received an invitation to the Heroku node.js beta.

<img src="/deploying-to-heorku/heroku_beta_invite.png" style="float:none;" />

Click the link at the bottom of the invitation email to activate your beta trial.

## Installing Heroku

To get started with Heroku, you first must install the heroku command line tool on your development computer.

	gem install heroku

Note: you may need to [install RubyGems](http://docs.rubygems.org/read/chapter/3).

## Creating your app on Heroku

Heroku node apps are supported on the Beech deployment stack, you will specify this when you run the `heroku create` command to add a new app.

Go to the github repository for your project. Then, at the command line, run `heroku create --stack beech`. When prompted for credentials, use the username and password from when you signed up; they’ll be saved in `~/.heroku/credentials` so that you aren’t prompted on future runs. It will also upload your public key to allow you to push and pull code.

	$heroku create  --stack beech
	Enter your Heroku credentials.
	Email: joe@example.com 
	Password: 
	Uploading ssh public key /Users/joe/.ssh/id_rsa.pub 
	Created http://high-sunrise-58.heroku.com/ | git@heroku.com:high-sunrise-58.git
	Git remote heroku added

Looking at the second to last line, you can see your app is called “high-sunrise-58”, and is available at <http://high-sunrise-58.heroku.com>. If you visit that URL now, you’ll see a standard welcome page, until you push your application up. The second URL - `git@heroku.com:high-sunrise-58.git` - is for the Git repository. Normally you would need to add this as a git remote; the `heroku create` command has done this for you automatically.

## Setting up your code for deployment

The file containing your app must be named `server.js`. You also must make sure it binds to the port specified on the `PORT` env var. For example:

<deploying-to-heroku/server.js>

Check this `server.js` file into git under the root directory of your project.

Don’t overlook the `parseInt` around the `process.env.PORT`. It's very important.

## Deploying to Heroku

Deploying to Heroku is entirely git based and super simple: just push your git repo up to Heroku.

	git push heroku master

You must have a valid `server.js` file, like the above, for Heroku to detect your application.

## You’re deployed!

Congratulations! Your Heroku app should now be deployed and available at <http://YOUR_APP_NAME.heroku.com>.

## Updating your application

When you have a change you want to make to your running application, simply commit it to git and push it to Heroku again.

	git push heroku master

## Adding collaborators

Right now, you're the only person who can deploy to your app to Heroku. To add collaborators is very simple:

	$ heroku sharing:add joe@example.com
	joe@example.com added as a full collaborator on myapp.

Each collaborator is sent an email immediately to let them know they were granted access to the app. If no existing Heroku account matches the email specified, an invitation email is sent.

## Being added as a collaborator

After being added, each new collaborator must go into your shared git repository and run:

	git remote add heroku git@heroku.com:theirapp.git

Now all team members can deploy with `git push heroku master`.

## Experimental Constraints

Since Heroku node.js support is still in beta, there are some constraints:

1. **64 connections limit** - Node is limited to 64 concurrent connections.
2. **30 second time out** - Connections will be terminated after 30 seconds.
3. **Web sockets aren’t supported** - the Heroku proxy configuration will not work with web sockets.
4. **No package management** - All dependencies must be added to your application repository.

Also note that all Heroku apps have a read-only file system (excepting the `/tmp` directory).

## Managing dependencies

Since Heroku doesn’t support [npm](http://nodeknockout.posterous.com/npmjs.org), you must add all of your code dependencies into your application repository. [Here’s how you can use NPM to vendor libraries](http://intridea.com/2010/8/24/using-npm-with-heroku-node-js).

## Cloning dependencies from Git

When cloning dependencies from Git, make sure submodules are removed. You can do so like this:

	$ cd myapp 
	$ rm -rf `find . -mindepth 2 -name .git` 
	$ git rm --cache `git submodule | cut -f2 -d' '` 
	$ git rm .gitmodules 
	$ git add . 
	$ git config -l | grep '^submodule' | cut -d'=' -f1 | xargs -n1 git config --unset-all 
	$ git commit -m "brought submodules into the main repo"

Run this command if you’re not sure whether your project uses submodules:

	$ find . -mindepth 2 -name .git

If it prints any output, you have submodules.

## Starter applications and tools

Node.js Knockout competitor [Corey Donohoe](http://www.atmos.org) has generously put together some sample applications to help people get started building apps Heroku:

* [heroku-express](http://github.com/atmos/heroku-express) - a simple app skeleton for running an express app on Heroku
* [http-pulse-app](http://github.com/atmos/http-pulse-app) - what you want out of http monitoring

The [Node.js Knockout website code](http://github.com/nko/website) also runs great on Heroku.