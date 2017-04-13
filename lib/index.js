'use strict';

let _ = require('lodash');
let debug = require('debug')('dev');
let co = require('co');

module.exports = function (baseSchema, lounge, couchbase) {

  if (!(baseSchema instanceof lounge.Schema)) {
    throw new Error('This module only work with lounge schema');
  }

  debug('baseSchema %o', baseSchema);
  let enhancement = require('./enhancement')(lounge, couchbase);

  // overwriting default loungeSchema
  let fnSchema = lounge.schema;
  lounge.schema = function (descriptor, options) {
    descriptor.doc_type = String;
    let schema = fnSchema.call(lounge, descriptor, options);

    schema.pre('save', function (next) {
      this.doc_type = this.modelName;
      next();
    });

    return schema;
  };

  // overwriting default loungeModel
  let fnModel = lounge.model;
  lounge.model = function (name, schema, options = {}) {
    let model = fnModel.call(lounge, name, schema, options);
    return model;
  };

  // let create primary index and doc_type index
  co(function * () {
    let primary = yield enhancement.createPrimaryIndex();
    let docTypeIndex = yield enhancement.docTypeIndex();
  }).catch(function (e) {
    console.log(e);
  });

  _.each(enhancement, function (v, k) {
    // skip the docTypeIndex
    if (k == 'primaryIndex') return;
    if (k == 'docTypeIndex') return;
    if (k == 'dropPrimaryIndex') return;
    if (k == 'dropIndex') return;
    baseSchema.static(k, v);
  });

};

