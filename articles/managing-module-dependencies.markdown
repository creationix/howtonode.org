Title: Managing module dependencies
Author: Kishore Nallan
Date: Mon Dec 05 2011 16:30:20 GMT
Node: v0.4.1

Following [this discussion](http://groups.google.com/group/nodejs/browse_thread/thread/9aa563f1fe3b3ff5) on the node.js mailing list about managing module dependencies, I thought it's worth sharing some pointers on that here.

## Using NPM to bundle your module dependencies

If you're building an application that is dependent on a number of NPM modules, you can specify them in your `package.json` file this way: 

	"dependencies": {
	  "express": "2.3.12",
	  "jade": ">= 0.0.1",
	  "redis":   "0.6.0"
	}

By doing so, every time you checkout your project fresh, all you need to do to get your dependencies sorted out is:

	$ npm install

Note that you can either require a specific version of a module, or a minimum version by prefixing the version number with `>=`.

## Managing development dependencies

If you have development related dependencies (e.g. testing framework) which you do not wish to install in production, specify them using the `devDependencies` property:

	"devDependencies": {
      "vows": "0.5.13"
    }

## Managing private NPM modules

If you're working on a private module, you can also add `"private": true` to the `package.json` file to prevent yourself from accidentally publishing your module to the NPM registry. 

## Specifying a git repo as a dependency

Finally, if you want to host your module in a private git repository, but still want to bundle it as a dependency to a project, you can do that too:

	"dependencies": {
		"secret-module": "git+ssh://git@github.com:username/secret-repo.git#v2.3"
	}

The last part of the URL (`v2.3`) specifies which tag should be used. You can also specify a commit hash or a branch name. 

This feature was added to the NPM only around mid August, so you will need a recent version of NPM for this to work. There are a lot more such [nifty feature requests](https://github.com/isaacs/npm/issues?labels=nice+to+have&sort=created&direction=desc&state=open&page=1) in the pipeline, so keep a watch out for them on NPM's Github repo.