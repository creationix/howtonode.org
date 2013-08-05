Title: Simplifying Chores with Grunt
Author: Swapnil Mishra
Date: Mon Aug 5 2013 19:24:00 GMT+0530
Node: v0.8.22

Often in various stages of development you do some repetitive tasks e.g minification, compilation, unit testing, linting and you obviously want to automate them. But each of these task require different configurations or installations. What if there could be system where in you can easily configure these tasks and run them from a single place. Also it would be really nice if it gels well with Node.js system. Meet [Grunt](http://gruntjs.com) a task runner for simplifying your chores. Apart from being simple Grunt ecosystem is huge and it's growing every day  with literally hundreds of plugins to choose from.

_Note that i will be using grunt task/plugin interchangeably which means the same_

## Installation

In order to get started first you need to install **grunt-cli**.

	npm install -g grunt-cli
This will install **grunt** command in your system. Note that this is different from the grunt task runner. Notice that we are installing grunt-cli in global scope. After this install grunt in your package.json directory using

	npm install grunt --save-dev
This will install grunt task runner and add it to [devDependencies](https://npmjs.org/doc/json.html#devDependencies) section of your package.json.

_You can also install grunt by adding it to devDependency of package.json manually and running npm install_

## Why is grunt-cli required

grunt-cli is used to run the local grunt task runner using node.js require() system. This helps you in running grunt task runner from any sub-folder of your project. The job of the grunt-cli is simple: run the version of grunt which has been installed next to a **Gruntfile** i.e under the **node_modules** folder.

## What is a Gruntfile

**Gruntfile** is where you define configurations for the task which you are planning to run. You can think of it as what package.json is for npm. Gruntfile is always placed at the top level of your project along with package.json. Below is a folder structure showing the Gruntfile for project.

![Gruntfile](/simplifying-chores-with-grunt/grunt.png "Folder structure showing Gruntfile")

_Please note that though we call it Gruntfile name of the file will be **Gruntfile.js**_


## Installing a grunt task

Best way to learn something is to create an example. Lets take a very common task for minifying set of css files and then combining them to single file.

As mentioned earlier grunt has an excellent repository of plugins to perform these tasks which can be found on [http://gruntjs.com/plugins](http://gruntjs.com/plugins). Doing a quick search on this page gives [cssmin](https://npmjs.org/package/grunt-contrib-cssmin) as one of the best plugin for it. To see installation and configuration instructions head over to the plugins [npm page](https://npmjs.org/package/grunt-contrib-cssmin).

As given in the npm page of [cssmin](https://npmjs.org/package/grunt-contrib-cssmin) install it with the given below command.
	
	npm install grunt-contrib-cssmin
 
 Now we have successfully installed a grunt task its time to use it in Gruntfile.

## Using a task in Gruntfile

Since we have installed our task into our project its time to dive into Gruntfile and use the task in it. Below is the Gruntfile for our task. Most of the parts could be understood with the comments given.

<simplifying-chores-with-grunt/Gruntfile.js>

Note that you have to wrap your Gruntfile in <code>module.exports</code>. Lets understand the various important parts of this Gruntfile.

## Understanding parts of Gruntfile

<code>**grunt.initConfig**</code> - Block where we define configurations specific to a plugin. In the example above i have show configuration for 1 plugin but there can be more than 1 in it. e.g

	cssmin: {
      // task/plugin 1
    },
    uglify: {
      // task/plugin 2
    }

<code>**grunt.loadNpmTasks**</code> - This the where we load the task/plugin.

<code>**grunt.registerTask**</code> - This is where we register the task. I am going to explain this part a bit more in the next section where we will learn to run this task of ours.

## Running a grunt task

Before diving into how to run a grunt task lets understand <code>grunt.registerTask</code> in depth. Recall from our Gruntfile below block of code.

	// Default task(s).
	// This is the task which runs if we just execute grunt command
  	grunt.registerTask('default', ['cssmin']);
  	// cssmin task
  	// This is a custom task which runs if we execute grunt buildcss command
  	grunt.registerTask('buildcss', ['cssmin']);

A Grunfile is run using either by running <code>**grunt**</code> command or <code>**grunt task-name**</code>. In our Gruntfile when we say <code>grunt.registerTask('default', ['cssmin'])</code>, this is what is going to run when we only type <code>**grunt**</code> command. Also note that second argument to <code>grunt.registerTask</code> is an array of task to be run.

<code>grunt.registerTask('buildcss', ['cssmin']) </code> defines a new custom task and contain cssmin. We can also add some other task to it. This is what is going to run when we type <code>**grunt buildcss**</code> command.

To summarize

	grunt
Runs default grunt task defined with <code>grunt.registerTask('default', ['cssmin'])</code>

	grunt buildcss
Runs custom grunt task defined with <code>grunt.registerTask('buildcss', ['cssmin'])</code>

Running any of these commands should produce our minified file with the following output.

![Output](/simplifying-chores-with-grunt/output.png "Output on running Gruntfile")

In both the cases second argument to <code>grunt.registerTask</code> can have more than one task. For example if we have JavaScript minification task [uglify](https://npmjs.org/package/grunt-contrib-uglify) in our Gruntfile with default <code>grunt.registerTask</code> as 

	grunt.registerTask('default', ['cssmin','uglify'])

This tutorial has just touched base on Grunt but there are in-numerous things which you can do using it. I use Grunt to for css/js minification, templates compilation, appending cache busting param, string replacements. Grunt community has built tasks for almost any thing you do. So do [check them out](http://gruntjs.com/plugins) and use it to automate your chores.







