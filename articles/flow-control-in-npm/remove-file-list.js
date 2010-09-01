function removeFileList(fileList, cb) {
  asyncMap(fileList, rm, cb)
}
