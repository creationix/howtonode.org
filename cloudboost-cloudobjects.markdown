Title: Store data with CloudBoost's CloudObjects
Author: Nawaz Dhandala
Date: Tue March 22 2016 08:53:58 GMT-0700 (PDT)
Node: v5.1.0


CloudBoost is a Database Service with storage, search and real-time capabilities. Think of CloudBoost as Parse + Firebase + Algolia all combined into one. CloudBoost has SDK's in multiple platforms which helps you build web, mobile and IoT apps without dealing with the backend and database infrastructure. 

## Pre-Requisites

### CloudBoost ###

[CloudBoost](http://www.cloudboost.io) is a Cloud Application Platform designed to make it easier for NodeJS developers to build apps. CloudBoost features include a Database Service, Queues, Cache and more built into one simple API. 

CloudBoost is in the npm registry. To install CloudBoost, you need to : 

    npm install cloudboost


## What will our application do?

To keep things simple, we're going to only tackle very basic functionality. We're going to build a course management system which registers, retrieves and deletes courses. Our application will support the following methods:

* Register a course (POST /course/:name)
* Retrieve a course (GET /course/:name)
* Deleting a course (DELETE /course/:name)

## Let's get started!

You need to create a new app [here](https://www.cloudboost.io) before you get started. Create a new account and create a new app to get started. 

Once your app is created. You'll have your client key and a master key. Please make sure you use master key when you're writing NodeJS applications. 

You need to initialize your new application. To initialize your app, 

<cloudboost-cloudobjects/init.js>

CloudBoost NodeJS module initializes your app with your App ID and Master Key. 


## Creating the package.json file

In order to manage dependencies, it is useful to create a `package.json` file. This file
provides details on the packages you depend on so that you can more easily use `npm` to manage
these dependencies.

Create a file named `package.json` in your application directory.

<cloudboost-cloudobjects/package.json>

The most important field in this JSON file is the `dependencies` field. This field will allow
you to execute `npm install` to install the dependencies for your project.


##Create a course table

After you have created your app. Got to CloudBoost Dashboard. click on `Manage App` button to got o tables page where you can cretae a course table in CloudBoost. Add a new column called `name` of type `text`. Once you're done,  you can switch back to your NodeJS app and begin writing code. 

## Inserting an object in CloudBoost

There is one route that we will need in order to register a course in your app. 

* POST /course/:name -> Adds an course to the database and returns 200.

The NodeJS script to register a course is as follows:

- You need to create a new CloudObject 
- Set object params by using `set()` function of CloudObject
- Save CloudObject using `save()` function.

<cloudboost-cloudobjects/addItem.js>


The response will be : 

    {
      status: 200,
      body: {
                message : "Course Registered."
            }
    }


## Retrieving an object in CloudBoost. 

To retrieve a course, You need to write one more route. You need call the get function of the CloudQuery instance with the name of the course.

* GET /course/:name -> Gets a course from CloudBoost Database.

The NodeJS script to get item from CloudBoost is as follows : 

<cloudboost-cloudobjects/getItem.js>

Response will be : 

    {
      status: 200,
      body: {
                course : {
                  _id : "XXXXX",
                    name: "Name_of_course"
                }
            }
    }


## Deleting an object from CloudBoost

To delete a course from CloudBoost, You need to write the DELETE route. You need call the `delete` function of the `CloudObject` instance with the key and value.

* DELETE /course/:name -> Delete an item from the cache.

The NodeJS script to delete an item from CloudBoost is as follows : 

<cloudboost-cloudobjects/deleteItem.js>

The response is

    {
      status: 200,
      body: {
                message : "Success"
            }
    }


## Summing it up

As you can see, getting started with CloudBoost and NodeJS with Modulus is fairly simple. To learn more about the CloudBoost, you can check the documentation [here](https://tutorials.cloudboost.io), and if you want to quickly get started with CloudBoost you can check the quickstart here  [https://www.cloudboost.io/quickstart](https://www.cloudboost.io/quickstart).

The full source code of the finished `app.js` is below:

<cloudboost-cloudobjects/app.js>
