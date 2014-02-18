var fs = require('fs');

//map
function map(array, filter, callback) {
  var counter = array.length;
  var new_array = [];
  array.forEach(function (item, index) {
    filter(item, function (err, result) {
      if (err) { callback(err); return; }
      new_array[index] = result;
      counter--;
      if (counter === 0) {
        callback(null, new_array);
      }
    });
  });
}
//filter
function filter(array, filter, callback) { 
  var counter = array.length;
  var valid = {};
  array.forEach(function (item, index) {
    filter(item, function (err, result) {
      if (err) { callback(err); return; }
      valid[index] = result;
      counter--;
      if (counter === 0) {
        var results = [];
        array.forEach(function (item, index) {
          if (valid[index]) {
            results.push(item);
          }
        });
        callback(null, results);
      }
    });
  });
}
//filtermap
function filterMap(array, filter, callback) {
  var counter = array.length;
  var new_array = [];
  array.forEach(function (item, index) {
    filter(item, function (err, result) {
      if (err) { callback(err); return; }
      new_array[index] = result;
      counter--;
      if (counter === 0) {
        new_array.length = array.length;
        callback(null, new_array.filter(function (item) {
          return typeof item !== 'undefined';
        }));
      }
    });
  });
}
//export
module.exports = {
  map: map,
  filter: filter,
  filterMap: filterMap
};
