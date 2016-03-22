app.delete('/course/:name', function(req,res) {
    var query = new CB.CloudQuery('Course');
    query.equalTo('name',req.params.name);
    query.findOne({
    	success : function(obj){
        if(obj){
        	obj.delete({
              success : function(obj){
                  res.status(200).send({message : "Success" });
              }, error: function(error){
                  res.status(500).send(error);
              }
          	});
          }else{
          	res.status(200).send({message : "Not found." });
          }
        }, error: function(error){
        	res.status(500).send(error);
        }
    });
});