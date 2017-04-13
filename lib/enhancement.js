'use strict';

let debug = require('debug')('dev');
let co = require('co');
let Promise = require('bluebird');
let queryBuilder = require('./query_builder');
let _ = require('lodash');
module.exports = function (lounge, couchbase) {

  let bucket = Promise.promisifyAll(lounge.bucket);
  let N1qlQuery = couchbase.N1qlQuery;
  let docTypeCreated = false;

  return {
    dropPrimaryIndex : function * () {

      co (function *() {

        let dropQuery = N1qlQuery.fromString(`DROP PRIMARY INDEX ON \`${bucket._name}\` USING GSI`);

        // error create index return null [] if no error occur
        try {
          let eDropQuery = yield bucket.queryAsync(dropQuery);
        } catch (e) {
          debug('error %o', e);
        }

      });

    },
    dropIndex : function * (name) {

      co (function *() {

        let dropQuery = N1qlQuery.fromString(`DROP INDEX \`${bucket._name}\`.\`${name}\` USING GSI`);

        // error create index return null [] if no error occur
        try {
          let eDropQuery = yield bucket.queryAsync(dropQuery);
        } catch (e) {
          debug('error %o', e);
        }

      });
    },
    createPrimaryIndex : function * () {

      co (function *() {

        let dropQuery = N1qlQuery.fromString(`CREATE PRIMARY INDEX ON \`${bucket._name}\` USING GSI`);
        debug('creating primary index');

        // error create index return null [] if no error occur
        try {
          let eDropQuery = yield bucket.queryAsync(dropQuery);
        } catch (e) {
          if (e.message.includes('already exists')) {
            debug('Primary Index already existed');
          } else {
            throw e;
          }
        }

      });

    },
    docTypeIndex : function * () {

      let error = false;
      co (function * () {

        let createQuery = N1qlQuery.fromString(`CREATE INDEX \`doc_type\` ON \`${bucket._name}\`(\`doc_type\`) USING GSI WITH {"defer_buid" : true};`);

        // error create index return null [] if no error occur
        try {
          let eCreateIndex = yield bucket.queryAsync(createQuery);
        } catch (e) {
          if (e.message.includes('already exists')) {
            debug('Index already existed');
          } else {
            throw e;
          }
          error = true;
        }

        let buildIndex = N1qlQuery.fromString(`BUILD INDEX ON \`${bucket._name}\`(doc_type) USING GSI;`);

        try {
          let eBuildIndex = yield bucket.queryAsync(buildIndex);
        } catch (e) {
          if (e.message.includes('already built')) {
            debug('DocType Index already built');
          } else {
            throw e;
          }
          error = true;
        }

      }).catch(function (e) {
        console.error(e.stack);
        throw e;
        error = e;
      });

      return error;
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

    find : function (query) {
      debug('Creating generic find method');
      if (this.modelName || !query.doc_type) {
        query.doc_type = this.modelName;
      }
      if (query.doc_type)        {return this.N1qlQuery('doc_type', query);}      else        {return this.N1qlQuery(query);}
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

    update : function (condition, query) {
      debug('udpate function');
      let documentExisted;
      if (typeof condition == 'string') {
        documentExisted = this.findById(condition);
      } else {
        documentExisted = this.find(condition);
      }
      return documentExisted.then(function success (v) {
        return _.merge(v, query).save();
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
            debug(`Index ${indexName} already built`);
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

      if (typeof indexName != 'string') {
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

      debug('Query %o', fullQs);

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
