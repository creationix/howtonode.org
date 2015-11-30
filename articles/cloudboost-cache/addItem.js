app.post('/item/:key/:value', function(req,res) {
    cache.get(req.params.key, req.params.value, {
      success : function(value){
        res.status(200).send({key : req.params.key, value : value});
      }, error : function(error){
        res.status(500).send(error);
      }
    });
});
