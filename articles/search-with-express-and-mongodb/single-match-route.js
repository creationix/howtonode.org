app.get('/query/:term', function(req, res){

  var term = req.params.term;
  var pattern = new RegExp(term, 'gi');

  db.employees.find({index:pattern}, function(err, results) {
    if( err || !results) {
      res.json([]);
    } else {
      res.json(results);
    }
  });  
  

});