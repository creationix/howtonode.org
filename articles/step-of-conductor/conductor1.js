var Conduct = require('conductor');

// Define the loadArticle function using Conduct from conductor.
var loadArticle = Conduct({
  M: ["_1", function loadMarkdown(name, callback) {
    // Async function that loads the contents of the markdown file.
    var filename = path.join("articles", name + ".markdown");
    Git.readFile(filename, callback);
  }],
  P: ["_1", "M1", function parseMarkdown(name, markdown) {
    // Sync function that parses the markdown and adds the name property
    var props = markdownPreParse(markdown);
    props.name = name;
    return props;
  }],
  A: ["P1", function loadAuthor(props, callback) {
    // Async function that loads the author based on props.author
    loadAuthor(props.author, callback);
  }],
  F: ["P1", "A1", function finalize(props, author) {
    // Final sync function that attaches the author object.
    props.author = author;
    return props;
  }]
}, "F1");
