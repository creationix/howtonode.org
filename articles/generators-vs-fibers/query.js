module.exports = function (req) {
  return {
    method: req.method,
    url: req.url,
    date: (new Date).toString()
  };
};
