desc('This is the default task.');
task('default', [], function () {
  console.log('This is the default task.');
  console.log(sys.inspect(arguments));
});

namespace('foo', function () {
  desc('This the foo:bar task');
  task('bar', [], function () {
    console.log('doing foo:bar task');
    console.log(sys.inspect(arguments));
  });

  desc('This the foo:baz task');
  task('baz', ['default', 'foo:bar'], function () {
    console.log('doing foo:baz task');
    console.log(sys.inspect(arguments));
  });

});
