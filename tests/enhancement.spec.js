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

    this.promiseMock = {
      all        : jasmine.createSpy('all').and.returnValue(true),
      promisifyAll : function (bucket) {
        return {
          queryAsync : jasmine.createSpy('queryAsync').and.returnValue(Promise.resolve('test')),
          _name      : 'test'
        };
      }
    };

    this.queryBuilderMock = {
      buildQuery : jasmine.createSpy('query-builder').and.returnValue('test')
    };

    mockery.registerMock('bluebird', this.promiseMock);
    mockery.registerMock('./query_builder', this.queryBuilderMock);

    this.module = require('../lib/enhancement');

  });

  afterEach(() => {
    mockery.disable();
    mockery.deregisterMock('bluebird');
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
      },
      getModel : function (modelName) {
        return function () {
          return {
            save : jasmine.createSpy('save').and.returnValue('test')
          };
        };
      },
      findById : function () {
        return Promise.resolve('test');
      }
    };

    let couchbaseMockup = {
      N1qlQuery : {
        fromString : jasmine.createSpy('fromString').and.returnValue('test')
      }
    };

    it ('should contains defined function', (done) => {

      let enhancement = this.module(lounge, couchbaseMockup);

      expect(enhancement).toEqual(jasmine.objectContaining({
        find : jasmine.any(Function),
        findOne : jasmine.any(Function),
        N1qlQuery: jasmine.any(Function),
        N1qlCreate : jasmine.any(Function),
        create : jasmine.any(Function)
      }));

      let query = { test : 'test' };
      let body  = { test : 'test' };

      let doc;
      doc = enhancement.findOneAndUpdate(query, body);
      expect(doc).toEqual(jasmine.any(Object));

      doc = enhancement.find(query, body);
      expect(doc).toEqual(jasmine.any(Object));

      doc = enhancement.create(body);
      expect(doc).toEqual(jasmine.any(String));

      doc = enhancement.findOne(query);
      expect(doc).toEqual(jasmine.any(Object));

      doc = enhancement.find(query);
      expect(doc).toEqual(jasmine.any(Object));
      done();
    });

  });

});
