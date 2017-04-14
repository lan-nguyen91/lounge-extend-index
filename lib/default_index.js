'use strict';

let debug = require('debug')('dev');
let co = require('co');
let Promise = require('bluebird');
let queryBuilder = require('./query_builder');
let _ = require('lodash');

module.exports = function (lounge, couchbase) {

  let bucket = Promise.promisifyAll(lounge.bucket);
  let N1qlQuery = couchbase.N1qlQuery;

  return {

    dropPrimaryIndex : function * () {

      co (function *() {

        let dropQuery = N1qlQuery.fromString(`DROP PRIMARY INDEX ON \`${bucket._name}\` USING GSI`);

        // error create index return null [] if no error occur
        try {
          let eDropQuery = yield bucket.queryAsync(dropQuery);
        } catch (e) {
          debug('error %o', e);
        }

      });

    },
    dropIndex : function * (name) {

      co (function *() {

        let dropQuery = N1qlQuery.fromString(`DROP INDEX \`${bucket._name}\`.\`${name}\` USING GSI`);

        // error create index return null [] if no error occur
        try {
          let eDropQuery = yield bucket.queryAsync(dropQuery);
        } catch (e) {
          debug('error %o', e);
        }

      });
    },
    createPrimaryIndex : function * () {

      co (function *() {

        let dropQuery = N1qlQuery.fromString(`CREATE PRIMARY INDEX ON \`${bucket._name}\` USING GSI`);
        debug('creating primary index');

        // error create index return null [] if no error occur
        try {
          let eDropQuery = yield bucket.queryAsync(dropQuery);
        } catch (e) {
          if (e.message.includes('already exists')) {
            debug('Primary Index already existed');
          } else {
            throw e;
          }
        }

      });

    },
    docTypeIndex : function * () {

      let error = false;
      co (function * () {

        let createQuery = N1qlQuery.fromString(`CREATE INDEX \`doc_type\` ON \`${bucket._name}\`(\`doc_type\`) USING GSI WITH {"defer_buid" : true};`);

        // error create index return null [] if no error occur
        try {
          let eCreateIndex = yield bucket.queryAsync(createQuery);
        } catch (e) {
          if (e.message.includes('already exists')) {
            debug('Index already existed');
          } else {
            throw e;
          }
          error = true;
        }

        let buildIndex = N1qlQuery.fromString(`BUILD INDEX ON \`${bucket._name}\`(doc_type) USING GSI;`);

        try {
          let eBuildIndex = yield bucket.queryAsync(buildIndex);
        } catch (e) {
          if (e.message.includes('already built')) {
            debug('DocType Index already built');
          } else {
            throw e;
          }
          error = true;
        }

      }).catch(function (e) {
        console.error(e.stack);
        throw e;
        error = e;
      });

      return error;
    },

    findOneAndUpdate : function (query, body) {
      debug('update function');

      let result = this.findOne(query);
      return result.then(function success (v) {
        return _.merge(v, body).save();
      }).catch(function (err) {
        return err;
      });
    },
    dropPrimaryIndex : function * () {

      co (function *() {

        let dropQuery = N1qlQuery.fromString(`DROP PRIMARY INDEX ON \`${bucket._name}\` USING GSI`);

        // error create index return null [] if no error occur
        try {
          let eDropQuery = yield bucket.queryAsync(dropQuery);
        } catch (e) {
          debug('error %o', e);
        }

      });

    },
    dropIndex : function * (name) {

      co (function *() {

        let dropQuery = N1qlQuery.fromString(`DROP INDEX \`${bucket._name}\`.\`${name}\` USING GSI`);

        // error create index return null [] if no error occur
        try {
          let eDropQuery = yield bucket.queryAsync(dropQuery);
        } catch (e) {
          debug('error %o', e);
        }

      });
    },
    createPrimaryIndex : function * () {

      co (function *() {

        let dropQuery = N1qlQuery.fromString(`CREATE PRIMARY INDEX ON \`${bucket._name}\` USING GSI`);
        debug('creating primary index');

        // error create index return null [] if no error occur
        try {
          let eDropQuery = yield bucket.queryAsync(dropQuery);
        } catch (e) {
          if (e.message.includes('already exists')) {
            debug('Primary Index already existed');
          } else {
            throw e;
          }
        }

      });

    },
    docTypeIndex : function * () {

      let error = false;
      co (function * () {

        let createQuery = N1qlQuery.fromString(`CREATE INDEX \`doc_type\` ON \`${bucket._name}\`(\`doc_type\`) USING GSI WITH {"defer_buid" : true};`);

        // error create index return null [] if no error occur
        try {
          let eCreateIndex = yield bucket.queryAsync(createQuery);
        } catch (e) {
          if (e.message.includes('already exists')) {
            debug('Index already existed');
          } else {
            throw e;
          }
          error = true;
        }

        let buildIndex = N1qlQuery.fromString(`BUILD INDEX ON \`${bucket._name}\`(doc_type) USING GSI;`);

        try {
          let eBuildIndex = yield bucket.queryAsync(buildIndex);
        } catch (e) {
          if (e.message.includes('already built')) {
            debug('DocType Index already built');
          } else {
            throw e;
          }
          error = true;
        }

      }).catch(function (e) {
        console.error(e.stack);
        throw e;
        error = e;
      });

      return error;
    }
  };
};
