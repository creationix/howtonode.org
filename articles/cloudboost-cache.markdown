Title: Turbo Charge your NodeJS app with Cache
Author: Nawaz Dhandala
Date: Tue Nov 24 2015 08:53:58 GMT-0700 (PDT)
Node: v5.1.0


Caching is great for your apps because it helps you to access data much faster when compared to the database. On the downside, querying is limited and it is very expensive (money-wise) because all the data is on the memory (which is expensive) instead of being on a disk. It is recommended that you use cache only for frequently accessed data.

## Pre-Requisites

### npm ###

[npm](http://github.com/isaacs/npm) is the most popular package manager for Node.js.
Installing npm is easy.

    curl http://npmjs.org/install.sh | sh

A note for windows users: npm does not currently work on windows. It will in the future.

### CloudBoost ###

[CloudBoost](http://www.cloudboost.io) is a Platform as a Service designed to make it easier for NodeJS developers to build apps. It has a Database Service, Queues, Cache and more built into one simple API. 

CloudBoost is in the npm registry.

    npm install cloudboost


## What will our application do?

To keep things simple, we're going to only tackle basic functionality. Our
application will support the following methods:

* Adding an item to the cache (POST /item/:key)
* Getting an item from a cache (GET /item/:key)
* Deleting an item from the cache (DELETE /item/:key)

## Lets get started!

You need to create a new app [here](https://www.cloudboost.io) before you get started. Create a new account and create a new app to get started. 

Once your app is created. You'll have your client key and a master key. Please make sure you use master key on the server. 

You need to initialize your new application. To initialize your app, 

<cloudboost-cache/init.js>

This JavaScript program initializes your app with your App ID and Master Key. 


## Creating the package.json file

In order to manage dependencies, it is useful to create a `package.json` file. This file
provides details on the packages you depend on so that you can more easily use `npm` to manage
these dependencies.

Create a file named `package.json` in your `cloudboost-cache` directory.

<cloudboost-cache/package.json>

The most important field in this JSON file is the `dependencies` field. This field will allow
you to execute `npm install` to install the dependencies for your project.

##What is a Cache?

Cache is basically a key-value pair in memory. Every value has a key associated with it and the key is used to retrieve or delete an item. Data resides in memory and this is why it is really fast when compared to a traditional disk based database. CloudBoost Cache is distributed which means you can scale it to store any amount of data you want.

## Adding an item to the cache

There is one route that we will need in order to add an item to the cache. You need call the set function of the CloudCache instance with the key and value.

* POST /item/:key -> Adds an item to the cache and returns 200.

The NodeJS script to add an item to the cache is as follows:

<cloudboost-cache/addItem.js>

When an item is added to the cache, it stays in the cache until you delete it. It is important that you don’t rely on cache as your primary data store and use it to compliment your existing infrastructure because sometimes machine goes down and when it does all the data in the cache is deleted. 

You can use a primary database like MySQL or MongoDB to repopulate the cache. 

If I request with key as "YourKey" and item with "YourItem" then the response will be:

    {
      status: 200,
      body: {
                key : 'YourKey', 
                item : 'YourItem'
            }
    }


## Retrieving an item from the cache. 

To retrieve an item from the cache, You need to write one more route. You need call the get function of the CloudCache instance with the key and value.

* GET /item/:key -> Gets an item from the cache.

The NodeJS script to add an item to the cache is as follows:

<cloudboost-cache/getItem.js>

Remember : Querying an item from the cache will NOT delete it. It stays in the cache until you request it for deletion (which we'll see in the next section). 

If I request the item with key as "YourKey" then the response will be:

    {
      status: 200,
      body: {
                key : 'YourKey', 
                item : 'YourItem'
            }
    }


## Deleting an item from the cache. 

To delete an item from the cache, You need to write the DELETE route. You need call the deleteItem function of the CloudCache instance with the key and value.

* DELETE /item/:key -> Delete an item from the cache.

The NodeJS script to add an item to the cache is as follows:

<cloudboost-cache/deleteItem.js>

The response is

    {
      status: 200,
      body: {
                key : 'YourKey', 
                item : 'YourItem'
            }
    }


## Summing it up

As you can see, getting started with CloudBoost Cache and NodeJS is simple. To learn more about the cache, you can check the documentation [here](https://tutorials.cloudboost.io/?lang=en&category=cache&subcategory=basiccache), and if you want to learn more about the CloudBoost API, you can check here [https://www.cloudboost.io/quickstart](https://www.cloudboost.io/quickstart).

The full source code of the finished `app.js` is below:

<cloudboost-cache/app.js>
