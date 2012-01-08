// Jasmine's syntax http://pivotal.github.com/jasmine/
describe('web-server', function() {
  // assuming we have mocks module :-D
  var mocks = require('./mocks');
  var loadModule = require('module-loader').loadModule;
  var module, fsMock, mockRequest, mockResponse;

  beforeEach(function() {
    fsMock = mocks.createFs();
    mockRequest = mocks.createRequest();
    mockResponse = mocks.createResponse();

    // load the module with mock fs instead of real fs
    // publish all the private state as an object
    module = loadModule('./web-server.js', {fs: fsMock});
  });

  it('extensionFromUrl() should parse basic extensions', function() {
    // we are testing private method of the module directly
    expect(module.extensionFromUrl('/some.html')).toBe('html');
    expect(module.extensionFromUrl('/another/file.js')).toBe('js');
    expect(module.extensionFromUrl('/file.with.more.dots.js')).toBe('js');
  });

  it('should return 200 if file exists', function() {
    // tell the mock, that this file exists
    fsMock.file('some/file.html');

    module.handleRequest(mockRequest, mockResponse);

    // wait for finishing the response, it's async
    waitsFor(function() {mockResponse.isFinished();});
    runs(function() {
      expect(mockResponse.status).toBe(200);
    });
  });
});
