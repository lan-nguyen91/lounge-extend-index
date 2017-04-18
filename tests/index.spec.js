
'use strict';

const mockery = require('mockery');
const co = require('co');
const _ = require('lodash');

describe('Index Test', function () {
  beforeEach(() => {

    mockery.enable({
      useCleanCache: true,
      warnOnReplace: false,
      warnOnUnregistered: false
    });

    this.loungeMockup = {
      schema : function (lounge, descriptor, options) {
        return {
          pre : jasmine.createSpy('pre').and.returnValue(true),
          static : jasmine.createSpy('static')
        };
      },
      bucket : {
        _name : 'Test'
      }
    };

    this.couchbaseMockup = {
      N1qlQuery : {
        fromString : jasmine.createSpy('fromString').and.returnValue('test')
      }
    };

    this.promiseMock = {
      promisifyAll : function (bucket) {
        return {
          queryAsync : jasmine.createSpy('queryAsync').and.returnValue(Promise.resolve('test')),
          _name      : 'test'
        };
      }
    };

    let self = this;
    this.primarySpy = jasmine.createSpy('createPrimaryIndex').and.returnValue(Promise.resolve(true));
    this.docTypeSpy = jasmine.createSpy('docTypeIndex').and.returnValue(Promise.resolve(true));
    this.defaultMock = function function_name () {
      return {
        createPrimaryIndex  : self.primarySpy,
        docTypeIndex  : self.docTypeSpy
      };
    };

    mockery.registerMock('bluebird', this.promiseMock);
    mockery.registerMock('./default_index', this.defaultMock);
    this.module = require('../lib/index.js');
  });

  afterEach(() => {
    mockery.disable();
  });

  it('should have only 1 function', (done) => {
    expect(this.module).toEqual(jasmine.any(Function));
    done();
  });

  describe ('test initialization functionality', () => {

    it('should extense schema with multiple function', (done) => {
      let self = this;

      this.module(self.loungeMockup, self.couchbaseMockup, null);

      expect(self.loungeMockup.schema).toEqual(jasmine.any(Function));

      let descriptor = {};
      let schema = self.loungeMockup.schema(descriptor, null);
      expect(schema.pre).toHaveBeenCalledWith('save', jasmine.any(Function));

      expect(descriptor).toEqual({
        doc_type : String
      });

      expect(schema).toEqual(jasmine.objectContaining({
        pre : jasmine.any(Function),
        static : jasmine.any(Function),
        find : jasmine.any(Function),
        findOne : jasmine.any(Function),
        update : jasmine.any(Function),
        N1qlQuery : jasmine.any(Function),
        N1qlCreate : jasmine.any(Function),
        create : jasmine.any(Function)
      }));

      expect(self.primarySpy).toHaveBeenCalledWith();
      done();
    });

  });

});
