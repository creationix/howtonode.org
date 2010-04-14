// Reads the authors in the authors directory and returns a data structure
function loadAuthors(callback) {
  var names;
  Step(
    function getFileNames() {
      Git.readDir("authors", this);
    },
    function readFileContents(err, results) {
      if (err) throw err;
      var parallel = this.parallel;
      results.files.forEach(function (filename) {
        var name = filename.replace(/\.markdown$/, '');
        loadAuthor(name, parallel());
      });
    },
    function parseFileContents(err) {
      if (err) throw err;
      var authors = {};
      Array.prototype.slice.call(arguments, 1).forEach(function (author) {
        authors[author.name] = author;
      });
      return authors;
    }
  );
}
