app.post('/course/:name', function(req,res) {
    var course = new CB.CloudObject('Course');
    course.set('name',req.params.name);
    course.save({
    	success : function(obj){
        	 res.status(200).send({message : "Course Registered" });
        }, error: function(error){
        	res.status(500).send(error);
        }
    });
});