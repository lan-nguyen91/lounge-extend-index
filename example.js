'use strict';

let lounge = require('lounge');
let extend = require('./lib');

let baseSchema = lounge.schema({});

extend(baseSchema, lounge);


