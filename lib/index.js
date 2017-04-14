'use strict';

let _ = require('lodash');
let debug = require('debug')('dev');
let co = require('co');

module.exports = function (lounge, couchbase, config) {

  config = _.defaults(config, {
    customeQueryString : 'query'
  });

  let enhancement = require('./enhancement')(lounge, couchbase, config);
  let defaultIndex = require('./default_index')(lounge, couchbase, config);

  // overwriting default loungeSchema
  let fnSchema = lounge.schema;
  lounge.schema = function (descriptor, options) {
    descriptor.doc_type = String;
    let schema = fnSchema.call(lounge, descriptor, options);

    schema.pre('save', function (next) {
      this.doc_type = this.modelName;
      next();
    });

    _.each(enhancement, function (v, k) {

      /*
       * Create stacking index method on top of overwrite schema
       * This method will attach functionlity of the model that use this schema
       * for ex:
       *      let schema = new Schema();
       *      let model = lounge.model(schema);
       *
       *      model will contains following property
       *      find, findOne, create, findOneAndUpdate, etc
       *      also set at base level so
       *
       *
       */
      schema.static(k, v);
      schema[k] = v;
    });

    return schema;
  };

  // overwriting default loungeModel
  // not neccessary now, revisit in the future
  /*
   *let fnModel = lounge.model;
   *lounge.model = function (name, schema, options = {}) {
   *  let model = fnModel.call(lounge, name, schema, options);
   *  return model;
   *};
   */

  // let create primary index and doc_type index
  co(function * () {
    let primary = yield defaultIndex.createPrimaryIndex();
    let docTypeIndex = yield defaultIndex.docTypeIndex();
  }).catch(function (e) {
    console.log(e);
  });

};

