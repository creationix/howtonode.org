Title: Content Syndication with Node.js
Author: Jean-Philippe Monette
Date: Thu Feb 28 2013 23:30:00 GMT-0500 (EST)
Node: v0.8.15

Web syndication is a must for any Website wishing to share some entries easily to other systems. Better known under their format name like [RSS](http://en.wikipedia.org/wiki/RSS_(file_format)) or [Atom](http://en.wikipedia.org/wiki/Atom_(standard)), they can be quite time consuming to generate without a module handling all their formating. Thanks to the power of Node's package manager [NPM](https://npmjs.org/), you can generate yours in no time.

## Installing the feed wrapper

Before we start, head to your project folder and install the latest version of the module [feed](https://github.com/jpmonette/feed):

	$ npm install feed

## Building the feed

First, we need to initialize a new `Feed` object. When you initialize the object, you must provide general information related to your Web syndication feed. 

	// Require module
	var Feed = require('feed');
    
    // Initializing feed object
	var feed = new Feed({
	    title:          'My Feed Title',
	    description:    'This is my personnal feed!',
	    link:           'http://example.com/',
	    image:          'http://example.com/logo.png',
	    copyright:      'Copyright © 2013 John Doe. All rights reserved',

	    author: {
	        name:       'John Doe',
	        email:      'john.doe@example.com',
	        link:       'https://example.com/john-doe'
	    }
	});

Second, you might want to identify your feed thematic. Both [RSS](http://en.wikipedia.org/wiki/RSS_(file_format)) and [Atom](http://en.wikipedia.org/wiki/Atom_(standard)) formats offer the possibility to identify one or multiple categories. Again, this is super simple to add:

	feed.category('Node.js');
	feed.category('JavaScript');

Third, every feed require at least one item (better known as an entry). To do so, you have to use the function `item` and provide the proper object. Of course, if you are running a content Website (like a blog!), chances are that you have multiple items. To populate your feed, use a `for` loop as followed:

	for(var key in posts) {
	    feed.item({
	        title:          posts[key].title,
	        link:           posts[key].url,
	        description:    posts[key].description,
	        date:           posts[key].date
	    });
	}

At this point, everything is ready to generate your [RSS](http://en.wikipedia.org/wiki/RSS_(file_format)) or Atom feed. Use the function `render`:

	var output = feed.render();

This is the implicit way of calling the `render` request. By default, it will render a [RSS](http://en.wikipedia.org/wiki/RSS_(file_format)) feed. You an also use the explicit way, allowing you to select between [RSS](http://en.wikipedia.org/wiki/RSS_(file_format)) or [Atom](http://en.wikipedia.org/wiki/Atom_(standard)):

	// Rendering a RSS 2.0 valid feed
	feed.render('rss-2.0');

	// Rendering an Atom 1.0 valid feed
	feed.render('atom-1.0');

Yes, it's that simple!

## Using with Express.js

Using `feed` with [Express.js](http://expressjs.com/) is super easy. Let's say you have an `app.get()` method routing the path `/rss`. To send your feed, render your feed like we mentionned previously. After, send the result by setting the proper `Content-Type` to `text/xml`:

	app.get('/rss', function(req, res) {

	    // Initializing feed object
		var feed = new Feed({
		    title:          'My Feed Title',
		    description:    'This is my personnal feed!',
		    link:           'http://example.com/',
		    image:          'http://example.com/logo.png',
		    copyright:      'Copyright © 2013 John Doe. All rights reserved',

		    author: {
		        name:       'John Doe',
		        email:      'john.doe@example.com',
		        link:       'https://example.com/john-doe'
		    }
		});

		// Function requesting the last 5 posts to a database. This is just an
		// example, use the way you prefer to get your posts.
		Post.findPosts(function(posts, err) {
			if(err)
				res.send('404 Not found', 404);
			else {
				for(var key in posts) {
				    feed.item({
				        title:          posts[key].title,
				        link:           posts[key].url,
				        description:    posts[key].description,
				        date:           posts[key].date
				    });
				}
				// Setting the appropriate Content-Type
				res.set('Content-Type', 'text/xml');

				// Sending the feed as a response
				res.send(feed.render('rss-2.0'));
			}
		});
	});

## Conclusion

There you go, it was super duper easy :)! Now, people can finally read your entries feeded from your Node.js application!