// A function for building a search index collection for mongodb
function processData(data, db) {

  // Iterate over raw data objects
  data.forEach(function(item){

    // Instantiate our index string
    var index = "";

    // Iterate over the object keys
    for (var key in item) {
       if (item.hasOwnProperty(key)) {
          var obj = item[key];
        
            // append the value to the index
            index += item[key];
        
       }
    }

    // Add the index attribute to the object
    item.index = index;

  });

  // Once all the data is processed lets insert it into mongo
  
  // Clear any existing data
  db.employees.drop();

  // Because we are passing an array of objects,
  // mongo knows to create a new document for each one
  db.employees.insert(data);

}