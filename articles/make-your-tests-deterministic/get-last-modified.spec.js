// Jasmine Syntax
describe('getLastModified', function() {

  var mocks = require('mocks');
  var mockery = {
    // reate a fake in-memory FS
    fs: mocks.fs.create({
      'one.js': mocks.fs.file('2012-01-01'),
      'two.js': mocks.fs.file('2012-02-02'),
      'three.js': mocks.fs.file('2012-02-02')
    })
  };

  // load the module (using fake FS)
  var getLastModified = mocks.loadFile('get-last-modified.js', mockery).getLastModified;


  it('should return last modified timestamps for every file', function() {
    var spy = jasmine.createSpy('done').andCallFake(function(err, timestamps) {
      expect(timestamps).toEqual([
        new Date('2012-01-01'), new Date('2012-02-02'), new Date('2012-02-02')
        ]);
    });

    getLastModified(['/one.js', '/two.js', '/three.js'], spy);

    // wait for done callback
    waitsFor(function() {return spy.callCount;});
  });
});
