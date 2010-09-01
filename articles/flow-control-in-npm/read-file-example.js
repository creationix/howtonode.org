fs.readFile("/etc/passwd", function (er, data) {
  if (er) throw er
  // doSomething(data)
})
