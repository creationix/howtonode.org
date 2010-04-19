var kiwi= require('kiwi')

kiwi.require('express');
require('express/plugins')

configure(function(){
  use(MethodOverride);
  use(ContentLength);
  use(Logger);
  set('root', __dirname);
})

get('/', function(){
  this.halt(200, "Hello World!");
})

run();
