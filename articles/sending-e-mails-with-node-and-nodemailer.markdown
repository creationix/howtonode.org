Title: Sending e-mails with Node and NodeMailer
Author: Dumitru Glavan
Date: Mon Jun 18 2012 18:49:38 GMT+0200 (CEST)
Node: v0.6.0

Sending e-mails with [NodeJS][] is almost a breeze. Almost. First, you have to plug-in the [NodeMailer][] module than set up a transport type, load the templates, add attachments and finally send...

## The Code

The first thing you tend to do is to create a wrapper class to manage all this tasks. So, I wrapped it in an Eamiler class to centralize the mail sending in my app.

    # /lib/emailer.coffee

    emailer = require("nodemailer")
    fs      = require("fs")
    _       = require("underscore")

    class Emailer

      options: {}

      data: {}

      # Define attachments here
      attachments: [
        fileName: "logo.png"
        filePath: "./public/images/email/logo.png"
        cid: "logo@myapp"
      ]

      constructor: (@options, @data)->

      send: (callback)->
        html = @getHtml(@options.template, @data)
        attachments = @getAttachments(html)
        messageData =
          to: "'#{@options.to.name} #{@options.to.surname}' <#{@options.to.email}>"
          from: "'Myapp.com'"
          subject: @options.subject
          html: html
          generateTextFromHTML: true
          attachments: attachments
        transport = @getTransport()
        transport.sendMail messageData, callback

      getTransport: ()->
        emailer.createTransport "SMTP",
          service: "Gmail"
          auth:
            user: "myappemail@gmail.com"
            pass: "secretpass"

      getHtml: (templateName, data)->
        templatePath = "./views/emails/#{templateName}.html"
        templateContent = fs.readFileSync(templatePath, encoding="utf8")
        _.template templateContent, data, {interpolate: /\{\{(.+?)\}\}/g}

      getAttachments: (html)->
        attachments = []
        for attachment in @attachments
          attachments.push(attachment) if html.search("cid:#{attachment.cid}") > -1
        attachments

    exports = module.exports = Emailer


In a standard [ExpressJS][] project structure you'll store this file in `/lib/emailer.coffee`.
You'll need to have the email templates stored in `/views/emails/` as HTML files and the attachments in `/public/images/email/`.

A potential email view will look like this:


    <!-- invite.html -->
    <html>
    <head>
      <title>Invite from Myapp</title>
    </head>
    <body>
      <p>
        Hi {{name}} {{surname}},
      </p>
      <p>
        Myapp would like you to join it's network on <a href="http://myapp.com">Myapp.com</a>.
        <br />
        Please follow the link bellow to register:
      </p>
      <p>
        <a href="http://myapp.com/register?invite={{id}}">http://myapp.com/register?invite={{id}}</a>
      </p>
      <p>
        Thank you,
        <br />
        Myapp Team
      </p>
      <p>
        <a href="http://myapp.com"><img src="cid:logo@myapp" /></a>
      </p>
    </body>
    </html>


[UnderscoreJS][] template will take care about your variables in the template and the `getAttachments()` function will automatically attache the files you need by the `cid` from the template.

To use the class in your code you have to instantiate a new Emailer object with the desired options, the template data and send the email:


    options =
      to:
        email: "username@domain.com"
        name: "Rick"
        surname: "Roll"
        subject: "Invite from Myapp"
        template: "invite"

    data =
      name: "Rick"
      surname "Roll"
      id: "3434_invite_id"

    Emailer = require "../lib/emailer"
    emailer = new Emailer options, data
    emailer.send (err, result)->
      if err
        console.log err


Using a [MongooseJS]: http://mongoosejs.com/ model for the invites you would have something like this:


    InviteSchema = new Schema
      email:
        type: String
      name:
        type: String
      surname:
        type: String
      status:
        type: String
        enum: ["pending", "accepted"]
        default: "pending"
      clicks:
        type: Number
        default: 0
      created_at:
        type: Date
        default: Date.now

    InviteSchema.methods.send = ()->
      options =
        to:
          email: @email
          name: @name
          surname: @surname
        subject: "Invite from Myapp"
        template: "invite"
      Emailer = require "../lib/emailer"
      emailer = new Emailer options, @
      emailer.send (err, result)->
        if err
          console.log err

    Invite = mongoose.model("Invite", InviteSchema)
    exports = module.exports = Invite


And you'll call it from an ExpressJS router:


    Invite = require('../models/invite')

    module.exports = (app)->

      app.post '/invites', (req, res)->
        data = req.body
        invite = new Invite data
        invite.save ()->
          invite.send()
        res.writeHead(303, {'Location': "/invites"})
        res.end()

      app.get '/invites', (req, res)->
        Invite.find().desc("created_at").run (err, invites)->
          res.render 'invites/invites', {title: "Invites", invites: invites}


That's all about it.

Your feedback is highly appreciated. Thanks.


[NodeJS]: http://nodejs.org/
[NodeMailer]: https://github.com/andris9/Nodemailer
[ExpressJS]: http://expressjs.com/
[UnderscoreJS]: http://underscorejs.org/
[MongooseJS]: http://mongoosejs.com/
