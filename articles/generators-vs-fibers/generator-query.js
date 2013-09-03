module.exports = function* (req) {
  // Simulate I/O with a sleep
  yield* sleep(100);
  // And then return the result!
  return {
    method: req.method,
    url: req.url,
    date: (new Date).toString()
  }
};

function* sleep(ms) {
  yield function (callback) {
    setTimeout(callback, ms);
  };
}
