function asyncMap (list, fn, cb_) {
  if (typeof cb_ !== "function") throw new Error(
    "No callback provided to asyncMap")
  var data = []
    , errState = null
    , l = list.length
  if (!l) return cb_(null, [])
  function cb (er, d) {
    if (errState) return
    if (arguments.length > 1) data = data.concat(d)
    if (er) return cb_(errState = er, data)
    else if (-- l === 0) cb_(errState, data)
  }
  list.forEach(function (ar) { fn(ar, cb) })
}
