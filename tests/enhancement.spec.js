
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

    let couchbaseMockup = {
      N1qlQuery : {
        fromString : jasmine.createSpy('fromString').and.returnValue('test')
      }
    }

    it ('should contains defined function', (done) => {

      let enhancement = this.module(lounge, couchbaseMockup);

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
      this.module(lounge, couchbaseMockup).N1qlCreate('test', 'test');
      expect(lounge.bucket.query).toHaveBeenCalledWith('test', jasmine.any(Function));
      done();
    });

  });

});
