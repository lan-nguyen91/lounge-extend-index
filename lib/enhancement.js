'use strict';

let debug = require('debug')('dev');
let co = require('co');
let Promise = require('bluebird');
let queryBuilder = require('./query_builder');
let _ = require('lodash');
module.exports = function (lounge, couchbase) {

  let bucket = Promise.promisifyAll(lounge.bucket);
  let N1qlQuery = couchbase.N1qlQuery;

  return {

    find : function (query) {
      debug('Creating generic find method');
      return this.N1qlQuery(query);
    },

    findOneAndUpdate : function (query, body) {
      debug('update function');

      let result = this.findOne(query);
      return result.then(function success (v) {
        return _.merge(v, body).save();
      }).catch(function (err) {
        return err;
      });
    },

    findOne : function (query) {
      debug('findOne method');
      let result = this.find(query);

      // return values to the promise and return the promise to the caller
      return result.then(function success (v) {
        return v[0];
      }).catch(function (err) {
        return err;
      });
    },

    update : function (id, query) {
      debug('udpate function');
      let userExisted = this.findById(id);
      return userExisted.then(function success (v) {
        return _.merge(v, query);
      }, function (err) {
        return err;
      });
    },

    N1qlCreate : function (indexName, indexFields) {

      debug('Creating Index %s', indexName);
      if (Array.isArray(indexFields)) {
        indexFields = indexFields.join(',');
      }

      co (function * () {

        let createQuery = N1qlQuery.fromString(`CREATE INDEX \`${indexName}\` ON \`${bucket._name}\`(${indexFields}) USING GSI WITH {"defer_buid" : true};`);

        // error create index return null [] if no error occur
        try {
          let eCreateIndex = yield bucket.queryAsync(createQuery);
        } catch (e) {
          if (e.message.includes('already exists')) {
            debug('Index already existed');
          } else {
            throw e;
          }
        }

        let buildIndex = N1qlQuery.fromString(`BUILD INDEX ON \`${bucket._name}\`(${indexName}) USING GSI;`);

        try {
          let eBuildIndex = yield bucket.queryAsync(buildIndex);
        } catch (e) {
          if (e.message.includes('already built')) {
            debug('Index already built');
          } else {
            throw e;
          }
        }

      }).catch(function (e) {
        console.error(e);
        throw e;
      });
    },

    N1qlQuery : function (indexName, query, options) {

      debug('Query Index %s %o', indexName, query);

      if (typeof indexName != 'strings') {
        options = query;
        query = indexName;
        indexName = undefined;
      }

      let fullQs = queryBuilder.buildQuery({
        indexName : indexName,
        query : query,
        options : options,
        bucketName : bucket._name
      }, options);

      let self = this;

      return bucket.queryAsync(N1qlQuery.fromString(fullQs)).then( function success (data) {
        let model = lounge.getModel(self.modelName);

        let result = [];
        if (Array.isArray(data)) {
          for (let idObject  of data) {
            result.push(model.findById(idObject.id));
          }
        }

        return Promise.all(result);

      }, function error (e) {
        console.error(e.stack);
      });
    },

    create : function (body) {

      let model = lounge.getModel(this.modelName);

      if (!model) {
        throw new Error('Failed to find defined model');
      }

      let mdlInstance = new model(body);
      return mdlInstance.save();
    }

  };
};
