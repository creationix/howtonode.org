require.paths.unshift(__dirname + '/../../lib')
require.paths.unshift(__dirname + '/../../lib/support/express/lib')
require.paths.unshift(__dirname + '/../../lib/support/hashlib/build/default')

require('express')
require('express/plugins')

configure(function(){
  use(MethodOverride)
  use(ContentLength)
  use(Cookie)
  use(Session)
  use(Logger)
  use(require('facebook').Facebook, {
    apiKey: 'FACEBOOK_API_KEY', 
    apiSecret: 'FACEBOOK_API_SECRET'
  })
  set('root', __dirname)
})

// Called to get information about the current authenticated user
get('/fbSession', function(){
  var fbSession = this.fbSession()

  if(fbSession) {
    // Here would be a nice place to lookup userId in the database
    // and supply some additional information for the client to use
  }

  // The client will only assume authentication was OK if userId exists
  this.contentType('json')
  this.halt(200, JSON.stringify(fbSession || {}))
})

// Called after a successful FB Connect
post('/fbSession', function() {
  var fbSession = this.fbSession() // Will return null if verification was unsuccesful

  if(fbSession) {
    // Now that we have a Facebook Session, we might want to store this new user in the db
    // Also, in this.params there is additional information about the user (name, pic, first_name, etc)
    // Note of warning: unlike the data in fbSession, this additional information has not been verified
    fbSession.first_name = this.params.post['first_name']
  }

  this.contentType('json')
  this.halt(200, JSON.stringify(fbSession || {}))
})

// Called on Facebook logout
post('/fbLogout', function() {
  this.fbLogout();
  this.halt(200, JSON.stringify({}))
})

// Static files in ./public
get('/', function(file){ this.sendfile(__dirname + '/public/index.html') })
get('/xd_receiver.htm', function(file){ this.sendfile(__dirname + '/public/xd_receiver.htm') })
get('/javascripts/jquery.facebook.js', function(file){ this.sendfile(__dirname + '/public/javascripts/jquery.facebook.js') })

run()
