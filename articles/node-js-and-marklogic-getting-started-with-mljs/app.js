
var mljs = require("mljs");

var db = new mljs({database: "Documents", port: 8002});

db.exists(function(result) {
  if (result.inError) {
    console.log("Uh oh - error: " + result.details);
  } else {
    console.log("Exists?: " + result.exists);

    var doc = {title: "Adam's poem", rating: 1, poem: "There's was an old database from Rome, who hated to be on his own.\nHe got connected to Node, and went on the road, and discovered lots of friends far from home."};

    db.save(doc, "/poems/1.json", function(result) {
      if (result.inError) {
        console.log("Uh oh - error: " + result.details);
      } else {
        console.log("Doc saved with URI: " + result.docuri);

        db.search("rome AND node",function(result) {
          if (result.inError) {
            console.log("Uh oh - error: " + result.details);
          } else {
            console.log("query results: \n" + JSON.stringify(result.doc));

          } // end search result if
        });

      } // end save if
    });

  } // end exists result if
});
