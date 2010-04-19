function loadArticle(name, callback) {
  var props;
  Step(
    function readFile() {
      Git.readFile(path.join("articles", name + ".markdown"), this);
    },
    function getAuthor(err, markdown) {
      if (err) throw err;
      props = markdownPreParse(markdown);
      props.name = name;
      loadAuthor(props.author, this);
    },
    function finish(err, author) {
      if (err) throw err;
      props.author = author;
      return props;
    }
  );
}
