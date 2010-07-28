// Multiple arguments
Do.chain(
  Do.read(__filename),
  function (text) {
    return Do.save("newfile", text);
  },
  function () {
    return Do.stat("newfile");
  }
)(function (stat) {
  // Do something
}, errorHandler);

// Single argument
var actions = [
  Do.read(__filename),
  function (text) {
    return Do.save("newfile", text);
  },
  function () {
    return Do.stat("newfile");
  }
];
Do.chain(actions)(function (stat) {
  // Do something
}, errorHandler);