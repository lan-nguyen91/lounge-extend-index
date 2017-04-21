const Logical = require('../lib/operators/logical');
const Comparison = require('../lib/operators/comparison');
const _ = require('lodash');

const keywords = [
  '$>', '$<', '$>=', '$<=',
  '$!=', '$like', '$notLike', '$between', '$notBetween',
  '$isValue', '$isNotValue'
];

const operationsMapping = {
  $or         : Logical.or,
  $and        : Logical.and,
  $not        : Logical.not,
  '$>'          : Comparison.gt,
  '$<'          : Comparison.lt,
  '$>='         : Comparison.ge,
  '$<='         : Comparison.le,
  '$!='         : Comparison.neq,
  $between    : Comparison.between,
  $notBetween : Comparison.notBetween,
  $like       : Comparison.like,
  $eq          : Comparison.eq,
  $neq          : Comparison.neq
};

const operationsMappingKeys = Object.keys(operationsMapping);

module.exports = function (query, descriptor) {

  function buildWhereQS (query, oriKey) {
    let expressions = [];

    Object.keys(query).forEach( function (key) {

      let layer = query[key];

      if (Array.isArray(layer)) {
        // the first element is an $and or $or
        let allExpressions = [];
        allExpressions[0] = key;
        for (let i = 0; i < layer.length; i++) {
          allExpressions = allExpressions.concat(buildWhereQS(layer[i]));
        }
        expressions.push(expressions.concat(allExpressions));
      } else if (typeof layer == 'object') {
        // if the query is nested operation
        // recursively call this function by passing expression array
        // so the inner call can append after running evaluation
        expressions = expressions.concat(buildWhereQS(layer, key));
      } else {
        let checkKey = oriKey || key;

        let isBackedTick =  /\`(.*)\`/.test(checkKey);
        let tmpCheckKey = null;

        // remove the back tick
        if (isBackedTick) {
          tmpCheckKey = checkKey.replace(new RegExp('`', 'g'), '');
        }

        // make sure to remove backtick before validating the schema
        let varType = null;

        if (tmpCheckKey) {
          varType = descriptor[tmpCheckKey].type;
        } else {
          varType = descriptor(checkKey);
        }

        // we haven't support nested model yet
        if (varType == 'model') {
          varType = 'string';
        }

        if (typeof layer != varType) {
          throw new Error('Data type mismatch for ' + layer + '. Expect type to be ' + varType);
        }
        // if the current level is simply key : value
        // ex :
        //      first_name : 'first'
        // simply append equal evaluation
        // layer is the value as layer = query[key]
        // but if the key is one of the keyword above, then call function accordingly
        if (typeof layer == 'string') {
          layer = '"' + layer + '"';
        }
        if (operationsMappingKeys.includes(key)) {
          if (oriKey !== undefined) {
            // use the outter key
            expressions.push(operationsMapping[key](oriKey, layer));
          } else {
            expressions.push(operationsMapping[key](key, layer));
          }
        } else {
          expressions.push(operationsMapping.$eq(key, layer));
        }
      }

    });

    return expressions;

  }

  let result = buildWhereQS(query);

  for (let i = 0; i < result.length; i++) {
    let each = result[i];
    if (Array.isArray(each)) {
      let op = each[0];
      each.splice(0, 1);
      result[i] = operationsMapping[op](each);
    }
  }

  if (result.length > 1) {
    return 'WHERE ' + Logical.and(result);
  } else {
    return 'WHERE ' + result;
  }

};
