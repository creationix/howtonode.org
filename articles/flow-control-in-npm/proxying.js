function removeFileList (fileList, cb) {
  asyncMap(fileList, rm, function (er) {
    if (er) log("Failed to remove fileList!")
    cb(er)
  })
}
