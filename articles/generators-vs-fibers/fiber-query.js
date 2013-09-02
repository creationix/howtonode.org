module.exports = function (req) {
  // Simulate I/O with a sleep
  sleep(100);
  // And then return the result!
  return {
    method: req.method,
    url: req.url,
    date: (new Date).toString()
  }
};

var Fiber = require('fibers');
function sleep(ms) {
  var fiber = Fiber.current;
  setTimeout(function() {
      fiber.run();
  }, ms);
  Fiber.yield();
}
