// Multiple arguments
Do.parallel(
  Do.read("/etc/passwd"),
  Do.read(__filename)
)(function (passwd, self) {
  // Do something
}, errorHandler);

// Single argument
var actions = [
  Do.read("/etc/passwd"),
  Do.read("__filename")
];
Do.parallel(actions)(function (results) {
  // Do something
}, errorHandler);