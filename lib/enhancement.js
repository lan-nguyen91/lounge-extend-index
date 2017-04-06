'use strict';

let debug = require('debug')('dev');
let co = require('co');
let N1qlQuery = require('couchbase').N1qlQuery;
let Promise = require('bluebird');
let queryBuilder = require('./query_builder');

module.exports = function (lounge) {

  let bucket = Promise.promisifyAll(lounge.bucket);

  return {

    find : function (query) {

    },

    findOne : function (query) {

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

  }
}
