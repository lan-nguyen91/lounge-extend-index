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
  extendIndex(lounge, couchbase, {
    customeQueryString : 'q'
  });

  let schema = lounge.schema({
    client_id : String,
    client_secret : String,
    grant : [String],
    redirectURI : String
  });

  schema.N1qlCreate('testing', ['client_id']);
  schema.N1qlCreate('ByClientAndSecret', ['client_id', 'client_secret']);
  let m = lounge.model('test', schema);

  let result = yield m.qByClientAndSecret('one', 'three');
  /*
   *let result = yield m.find({
   *  client_id : 'one',
   *  client_secret : 'three'
   *});
   */

  console.log(result);

}).catch(function (e) {
  console.log(e.stack);
});
