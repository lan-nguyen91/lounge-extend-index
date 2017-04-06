'use strict';

let _ = require('lodash');

module.exports = function (baseSchema, lounge) {

  let enhancement = require('./enhancement')(lounge);

  if (!baseSchema instanceof lounge.schema) {
    throw new Error('This module only work with lounge schema');
  }

  _.each(enhancement, function(v, k){
    baseSchema.static(k, v);
  });

}

