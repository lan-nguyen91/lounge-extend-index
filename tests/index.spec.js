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

    this.module = require('../lib/index.js');
  });

  afterEach(() => {
    mockery.disable();
  });

  it('should have only 1 function', (done) => {
    expect(this.module).toEqual(jasmine.any(Function));
    done();
  });

  describe ('test core functionality', () => {
    let loungeMockup = jasmine.createSpy('lounge');

    loungeMockup = {
      Schema : String
    };

    let couchbaseMockup = {
      N1qlQuery : {}
    };

    it('should throw error if passing falsy schema', (done) => {
      expect(() => this.module('test', loungeMockup, couchbaseMockup)).toThrowError('This module only work with lounge schema');
      done();
    });

  });

  describe ('test core functionality', () => {
    let loungeMockup = jasmine.createSpy('lounge');

    loungeMockup = {
      Schema : Object,
      bucket : {
        query : jasmine.createSpy('query')
      }
    };

    let schema = {
      static : jasmine.createSpy('static')
    };

    let couchbaseMockup = {
      N1qlQuery : {}
    };

    it('should extend the schema with multiple functions', (done) => {
      this.module(schema, loungeMockup, couchbaseMockup);
      expect(schema).toEqual(jasmine.any(Object));
      done();
    });

  });

});
