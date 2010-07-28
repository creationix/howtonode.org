//define
function divide(a, b) { return function (callback, errback) {
  // Use nextTick to prove that we're working asynchronously
  process.nextTick(function () {
    if (b === 0) {
      errback(new Error("Cannot divide by 0"));
    } else {
      callback(a / b);
    }
  });
}}
//use
divide(100, 10)(function (result) {
  console.log("the result is " + result);
}, function (error) {
  throw error;
});
