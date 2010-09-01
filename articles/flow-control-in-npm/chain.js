function chain () {
  var steps = Array.prototype.slice.call(arguments)
    , cb_ = steps.pop()
    , n = 0
    , l = steps.length
  function cb (er) {
    if (er) return cb_(er)
    if (++ n === l) return cb_()
    steps[n](cb)
  }
  steps[n](cb)
}
