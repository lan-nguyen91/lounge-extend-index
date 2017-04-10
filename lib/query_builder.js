
let _ = require('lodash');

module.exports.buildQuery = function (queryData, options = {}) {
  let query = queryData.query;
  let bucketName  = queryData.bucketName;

  let fullQs = '';

  let queryIndexQs = '';
  if (queryData.indexName !== undefined) queryIndexQs = `use index (${queryData.indexName} using GSI) `;

  let whereQs = [];
  if (_.size(query)) {
    _.each(query, (v, k) => {
      let varType = this.schema.descriptor[k].type;
      if (typeof v != varType) {
        throw new Error('Data type mismatch');
      } else {
        whereQs.push(`${k}=${v}`);
      }
    });
    whereQs = 'WHERE ' + whereQs.join(' AND ');
  }

  let pagingQs = '';
  if (options.limit !== undefined && options.skip !== undefined) {
    pagingQs = ' LIMIT ' + options.limit + ' OFFSET ' + options.skip;
  } else if (options.limit !== undefined) {
    pagingQs = ' LIMIT ' + options.limit;
  } else if (options.skip !== undefined) {
    throw new Error('Must have limit to use skip.');
  }

  let sortQs = '';
  if (options.sort !== undefined) {
    let sortKeys = options.sort;
    if (typeof sortKeys === 'string') {
      sortKeys = [sortKeys];
    }

    if (Array.isArray(sortKeys)) {
      sortQs = ' ORDER BY ' + sortKeys.join(',');
    } else if (sortKeys instanceof Object) {
      let sortWords = [];
      for (let i in sortKeys) {
        if (sortKeys.hasOwnProperty(i)) {
          if (sortKeys[i] === 1 || sortKeys[i] === true) {
            sortWords.push(i + ' ASC');
          } else {
            sortWords.push(i + ' DESC');
          }
        }
      }
      sortQs = ' ORDER BY ' + sortWords.join(',');
    } else {
      throw new Error('Unknown sort value.');
    }
  }

  fullQs = `select id from \`${bucketName}\` ` + queryIndexQs + whereQs + pagingQs + sortQs;
  return fullQs;
};
