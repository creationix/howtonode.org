app.get('/item/:key', function(req,res) {
    cache.get(req.params.key,{
      success : function(value){
        res.status(200).send({key : req.params.key, value : value});
      }, error : function(error){
        res.status(500).send(error);
      }
    });
});