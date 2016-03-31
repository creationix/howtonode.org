app.get('/course/:name', function(req,res) {
    var query = new CB.CloudQuery('Course');
    query.equalTo('name',req.params.name);
    query.findOne({
    	success : function(obj){
        	 res.status(200).send({course : CB.toJSON(obj) });
        }, error: function(error){
        	res.status(500).send(error);
        }
    });
});