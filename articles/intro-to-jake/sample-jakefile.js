desc('This is the default task.');
task('default', [], function (params) {
  console.log('This is the default task.');
  console.log(sys.inspect(arguments));
});
