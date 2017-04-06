'use strict';

let lounge = require('lounge');
let extend = require('lounge-extend-index');

let baseSchema = lounge.schema({});

extend(baseSchema, lounge);

console.log(baseSchema);

