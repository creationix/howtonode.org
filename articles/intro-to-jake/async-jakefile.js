desc('This is an asynchronous task.');
task('asynchronous', [], function () {
  setTimeout(function () {
    console.log("Yay, I'm asynchronous!");
    complete();
  }, 1000);
}, true);