app.get('/query/:term', function(req, res){

  var term = req.params.term;

  // Break out all the words
  var words = req.params.term.split(" ");
  var patterns = [];

  // Create case insensitve patterns for each word
  words.forEach(function(item){
    patterns.push(caseInsensitive(item));
  });

  db.employees.find({index : {$all: patterns }}, function(err, results) {
    if( err || !results) {
      res.json([]);
    } else {
      res.json(results);
    }
  });  
  

});