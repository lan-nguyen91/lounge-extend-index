'use strict';

let debug = require('debug')('dev');
let co = require('co');
let Promise = require('bluebird');
let queryBuilder = require('./query_builder');
let _ = require('lodash');

module.exports = function (lounge, couchbase, config) {

  let bucket = Promise.promisifyAll(lounge.bucket);
  let N1qlQuery = couchbase.N1qlQuery;

  return {

    findOneAndUpdate : function (query, body) {
      debug('update function');

      let result = this.findOne(query);
      return result.then(function success (v) {
        return _.merge(v, body).save();
      }).catch(function (err) {
        return err;
      });
    },

    find : function (query = {}, options = {}) {
      debug('Creating generic find method');
      if (this.modelName || !query.doc_type) {
        query.doc_type = this.modelName;
      }
      if (query.doc_type) {
        return this.N1qlQuery('doc_type', query, options);
      } else {
        return this.N1qlQuery(query, options);
      }
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

      if (!(this instanceof lounge.Schema)) {
        throw new Error('Expect this to be a Schema call');
      };

      let originIndexFields = indexFields;

      debug('Creating Index %s', indexName);

      if (!Array.isArray(indexFields)) {
        indexFields = [indexFields];
      }

      for ( let i in indexFields ) {
        indexFields[i] = `\`${indexFields[i]}\``;
      }

      indexFields = indexFields.join(',');

      let successCreated = false;
      let successBuild = false;

      co (function * () {

        let createQuery = N1qlQuery.fromString(`CREATE INDEX \`${indexName}\` ON \`${bucket._name}\`(${indexFields}) USING GSI WITH {"defer_buid" : true};`);

        // error create index return null [] if no error occur
        try {
          let eCreateIndex = yield bucket.queryAsync(createQuery);
          successCreated = true;
        } catch (e) {
          if (e.message.includes('already exists')) {
            debug('Index already existed');
            successCreated = true;
          } else {
            throw e;
          }
        }

        let buildIndex = N1qlQuery.fromString(`BUILD INDEX ON \`${bucket._name}\`(${indexName}) USING GSI;`);

        try {
          let eBuildIndex = yield bucket.queryAsync(buildIndex);
          successBuild = true;
        } catch (e) {
          if (e.message.includes('already built')) {
            debug(`Index ${indexName} already built`);
            successBuild = true;
          } else {
            throw e;
          }
        }

      }).catch(function (e) {
        console.error(e);
        throw e;
      });

      let self = this;
      this.static(config.customQueryString + indexName, function () {
        let params = arguments;

        let options = undefined;
        let nOperators = params.length;

        // check if last param is an option
        let testOptions = params[nOperators - 1];
        if (typeof testOptions == 'object') {
          let optionsToCheck = ['sort', 'limit', 'offset', 'count', 'load'];

          // if contains one of the params defined, it is an options
          _.each(optionsToCheck, function (v, k) {
            if (!!testOptions[v]) options = testOptions;
          });

        }

        let queryObject = {};
        // if the last one is an option, move 1 index to capture all the actual query
        if (options) {
          nOperators -= 1;
        }

        let nQueryField = null;
        Array.isArray(originIndexFields) ? nQueryField = originIndexFields.length : nQueryField = 1;

        // nOperator is the actual query being passed
        // nQueryField is what has been defined
        if (nOperators !== nQueryField) {
          throw Error('Numbder of query being passed is not equal to the defined index fields');
        }

        for (let i = 0; i < nQueryField; i++) {
          queryObject[originIndexFields[i]] = params[i];
        }

        queryObject.doc_type = this.modelName;

        return this.N1qlQuery(indexName, queryObject, options);
      });
    },

    N1qlQuery : function (indexName, query, options ) {

      debug('Query Index %s %o', indexName, query);

      if (typeof indexName != 'string') {
        options = query;
        query = indexName;
        indexName = undefined;
      }

      let fullQs = queryBuilder.buildQuery.call(this, {
        indexName : indexName,
        query : query,
        options : options,
        bucketName : bucket._name
      }, options);

      debug('Query %o', fullQs);

      let self = this;

      // ------------- for nested model -------------
      let tobeLoad = null;
      if (!!options && !!options.load) {
        tobeLoad = {};
        let descriptor = self.schema.descriptor;
        // loop thru the schema, if
        // the descriptor is a model, load it up
        if (options.load.all) {
          _.each(descriptor, (v, k) => {
            if (v.type == 'model') {
              tobeLoad[k] = {
                modelName : v.modelName
              };
            }
          });
        } else {
          _.each(options.load, (v, k) => {
            if (v) {
              // k is the key to be load
              if (!!descriptor[k] && descriptor[k].type == 'model') {
                tobeLoad[k] = {
                  modelName : descriptor[k].modelName
                };
              }
            }
          });
        }
      }

      return bucket.queryAsync(N1qlQuery.fromString(fullQs)).then( function success (data) {
        let model = lounge.getModel(self.modelName);
        let result = [];
        let loadPromise = null;

        if (_.size(tobeLoad)) loadPromise = true;

        if (loadPromise) {
          let nestedPromise = [];
          for (let dataObject  of data) {

            if (_.size(tobeLoad)) {
              _.each(dataObject.default, (v, k) => {
                if (tobeLoad[k]) {
                  let childModel = lounge.getModel(tobeLoad[k].modelName);
                  let nestedObj = childModel.findById(dataObject.default[k]);
                  // push all promise to array to check when they all resolve
                  nestedPromise.push(nestedObj);
                  nestedObj.then(function (data) {
                    dataObject.default[k] = new childModel(data);
                    result.push(new model(dataObject.default));
                  });
                }
              });

            }
          }

          return Promise.all(nestedPromise).then(function () {
            return result;
          });
        } else {

          for (let dataObject  of data) {
            result.push(new model(dataObject.default));
          }
          return result;
        }


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
