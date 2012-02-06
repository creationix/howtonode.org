Title: Really simple file uploads with Express
Author: Srirangan
Date: Sun Feb 05 2012 11:00:00 GMT+0530 (IST)
Node: v0.6.10

Few days ago I was working on a fairly typical web application and I faced the challenge of implementing a fairly
typical web application feature - file uploads. It was the first time I was implementing file uploads with Node (and
Express) and I did what anyone else would do - I googled it.

Unfortunately all the articles / posts out there are either outdated, too complex or plain wrong. So I did the next
most obvious thing - post a question on the mailing list. As always Mr. Holowaychuk was incredibly quick to respond.
His answer lead me to do what I should have done in the first place - read the docs.

## The upload form
This is the most obvious part of the challenge. You're probably familiar with this already. Anyway, for the sake of
completeness of this article, here it is.

You will need a form in your browser for the file upload. I use Jade to generate my HTML and here how it looks:

    form(action="...", method="post", enctype="multipart/form-data")
      input(type="file", name="displayImage")

The *form.action* will point to a route that handles the file upload. More below.

## Accessing the uploaded file
If you're using recents versions of Node and Express, file uploads are a piece of cake. And I'll back this claim but
before we go any further make sure you're familiar with [routes, requests and responses in Express](http://expressjs.com/guide.html).

Okay, now let's justify the "piece of cake" claim. In our file upload route, the *req* parameter has *req.files*
available. Here's an example of what the *req.files* would contain:

    {
      displayImage: {
        size: 11885,
        path: '/tmp/1574bb60b4f7e0211fd9ab48f932f3ab',
        name: 'avatar.png',
        type: 'image/png',
        lastModifiedDate: Sun, 05 Feb 2012 05:31:09 GMT,
        _writeStream: {
          path: '/tmp/1574bb60b4f7e0211fd9ab48f932f3ab',
          fd: 14,
          writable: false,
          flags: 'w',
          encoding: 'binary',
          mode: 438,
          bytesWritten: 11885,
          busy: false,
          _queue: [],
          drainable: true
        },
        length: [Getter],
        filename: [Getter],
        mime: [Getter]
      }
    }

In the *req.files* object above, the property *displayImage* is the name of the file field in your HTML form and
*req.files* will contain one property each for every valid HTML file form field.

The file object contains the *type*, *size* and *name* properties for your server side validations.

## Saving the uploaded file

Assuming the file is valid, you use the *path* property for the next step. The *path* would typically contain a location
in the *tmp* folder. Your application logic could either require you to access the contents of the file or simply move
the uploaded file to another location.

    fs.readFile(req.files.displayImage.path, function (err, data) {
      // ...
      var newPath = __dirname + "/uploads/uploadedFileName";
      fs.writeFile(newPath, data, function (err) {
        res.redirect("back");
      });
    });

In the *fs.readFile* callback, we have the *data* parameter through which we can access the contents of the file. The
example above is taken from an application that needed to modify the file and save it in a new location. Thus
*fs.writeFile* is used to write *data* to the *newPath*.

If your app needs to simply move the uploaded file without modifying the contents *fs.rename* can be used as more
simpler option.

---

That's all there is to it. I've done file uploads in many server side languages including Python, Java, Scala and PHP
and I don't think its ever been this simple. So much for JavaScript being labeled as an inferior server side language.
