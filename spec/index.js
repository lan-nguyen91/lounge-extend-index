'use strict';

const lounge = require('lounge');
const couchbase = require('couchbase');
const extendIndex = require('../lib/index');
const co = require('co');

let baseSchema = lounge.schema({
  metadata: {
    doc_type: String,
    createdAt: Date,
    updatedAt: Date
  }
});



co (function * () {
  yield lounge.connect({
    connectionString : '127.0.0.1',
    bucket : 'default'
  });

  let baseSchema = lounge.schema({
    metadata: {
      doc_type: String,
      createdAt: Date,
      updatedAt: Date
    }
  });
  extendIndex(baseSchema, lounge, couchbase);

  let schema = lounge.schema({
    client_id : String,
    client_secret : String,
    grant : [String],
    redirectURI : String
  });

  schema.statics.N1qlCreate('testing', ['client_id']);
  let m = lounge.model('test', schema);

  let result = yield m.find({
    client_id : 'one',
    client_secret : 'two'
  });
  console.log(result);

}).catch(function (e) {
  console.log(e.stack);
});
