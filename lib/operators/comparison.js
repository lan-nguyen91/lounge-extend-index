'use strict';
const _ = require('lodash');

class Comparison {

  static eq ( left, right ) {
    return left + '=' + right;
  }

  static neq (left, right) {
    return left + '!=' + right;
  }

  static gt (left, right) {
    return left + '>' + right;
  }

  static ge (left, right) {
    return left + '>=' + right;
  }

  static lt (left, right) {
    return left + '<' + right;
  }

  static le (left, right) {
    return left + '<=' + right;
  }

  static between (left, right) {

    if (_.isArray(right)) {
      let valArr = Array.from(right);
      if (valArr.length == 2) {
        return left + ' BETWEEN ' + valArr[0] + ' AND ' + valArr[1];
      } else {
        throw Error('Invalid range');
      }
    } else {
      throw Error('Invalid range');
    }
  }

  static notBetween (left, right) {
    if (_.isArray(right)) {
      let valArr = Array.from(right);
      if (valArr.length == 2) {
        return left + ' NOT BETWEEN ' + valArr[0] + ' AND ' + valArr[1];
      } else {
        throw Error ('Invalid range');
      }
    } else {
      throw Error('Invalid range');
    }
  }

  static like (left, right) {
    return left + ' LIKE ' + right;
  }

  static notLike (left, right) {
    return left + ' NOT LIKE ' + right;
  }

  static isNull (left, right) {
    return left + ' IS ' + right;
  }

  static isNotNull (left, right) {
    return left + ' IS NOT ' + right;
  }

  static isMissing (field) {
    return field  + ' IS MISSING';
  }

  static isNotMissing (field) {
    return field + ' IS NOT MISSING';
  }

  static isValued (field) {
    return field + ' IS VALUED';
  }

  static isNotValued (field) {
    return field + ' IS NOT VALUED';
  }
}

module.exports = Comparison;
