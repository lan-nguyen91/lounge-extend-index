
'use strict';

const mockery = require('mockery');
const co = require('co');
const _ = require('lodash');
const N1qlQuery = require('couchbase').N1qlQuery;

describe('Enhanement Test', function () {
  beforeEach(() => {

    mockery.enable({
      useCleanCache: true,
      warnOnReplace: false,
      warnOnUnregistered: false
    });

    this.module = require('../lib/enhancement.js');
  });

  afterEach(() => {
    mockery.disable();
  });

  it('should have only 1 function', (done) => {
    expect(this.module).toEqual(jasmine.any(Function));
    done();
  });

  describe('should return all function when calling module', () => {
    let lounge = {
      bucket : {
        query : jasmine.createSpy('bucket'),
        _name : 'test'
      }
    };

    it ('should contains defined function', (done) => {

      let enhancement = this.module(lounge);

      expect(enhancement).toEqual(jasmine.objectContaining({
        find : jasmine.any(Function),
        findOne : jasmine.any(Function),
        N1qlQuery: jasmine.any(Function),
        N1qlCreate : jasmine.any(Function),
        create : jasmine.any(Function)
      }));

      done();
    });

    it ('should throw an error of existed index', (done) => {
      let N1qlQueryMock = N1qlQuery.fromString(`CREATE INDEX \`test\` ON \`test\`(test) USING GSI WITH {"defer_buid" : true};`)
      this.module(lounge).N1qlCreate('test', 'test');
      expect(lounge.bucket.query).toHaveBeenCalledWith(jasmine.any(Object), jasmine.any(Function));
      done();
    });

  });

});
