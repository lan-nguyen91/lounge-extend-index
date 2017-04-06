'use strict';

let _ = require('lodash');

module.exports = function (baseSchema, lounge) {

  if (!(baseSchema instanceof lounge.schema)) {
    throw new Error('This module only work with lounge schema');
  }

  let enhancement = require('./enhancement')(lounge);

  _.each(enhancement, function (v, k) {
    baseSchema.static(k, v);
  });

};

