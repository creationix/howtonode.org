var Step = require('step')

Step(
  function loadData() {
    Git.getTags(this.parallel());
    loadAuthors(this.parallel());
  },
  function renderContent(err, tags, authors) {
    if (err) return response.simpleText(500, err.stack);
    var data = {}; // Truncated for clarity
    renderTemplate('index', data, this);
  },
  function showPage(err, content) {
    if (err) return response.simpleText(500, err.stack);
    render(request, response, {
      title: "Index",
      content: content
    });
  }
);

