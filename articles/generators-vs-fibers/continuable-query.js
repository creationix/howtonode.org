module.exports = query;
function query(req, callback) {
  // If the callback isn't passed in, return a continuable.
  if (!callback) return query.bind(this, req);

  // Simulate I/O with a timer
  setTimeout(function () {
    callback(null, {
      method: req.method,
      url: req.url,
      date: (new Date).toString()
    });
  }, 100);
}
