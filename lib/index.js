'use strict';

let _ = require('lodash');

module.exports = function (baseSchema, lounge, couchbase) {

  if (!(baseSchema instanceof lounge.Schema)) {
    throw new Error('This module only work with lounge schema');
  }

  let enhancement = require('./enhancement')(lounge, couchbase);

  _.each(enhancement, function (v, k) {
    baseSchema.static(k, v);
  });

};

