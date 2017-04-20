'use strict';

class Comparison {

  static equal ( left, right ) {
    return left + '=' + right;
  }

  static doubleEqual(left, right) {
    return left + '==' + right;
  }

  static notEqual(left, right) {
    return left + '!=' + right;
  }

  static notEqualBracket(left, right) {
    return left + '<>' + right;
  }

  static gt(left, right) {
    return left + '>' + right;
  }

  static ge(left, right) {
    return left + '>=' + right;
  }

  static lt(left, right) {
    return left + '<' + right;
  }

  static le(left, right) {
    return left + '<=' + right;
  }

  static between(left, right) {
    if (_.isArray(right) && right.length == 2) {
      return left + ' BETWEEN' + min(right) + ' AND ' + max(right);
    } else {
      throw Error('Invalid range');
    }
  }

  static notBetween(left, right) {
    if(_.isArray(right) && right.length == 2) {
      return left + ' NOT BETWEEN ' + min(right) + ' AND ' +  max(right);
    } else {
      throw Error('Invalid range');
    }
  }

  static like(left, right) {
    return left + ' LIKE ' + right;
  }

  static notLike(left, right) {
    return left + ' NOT LIKE ' + right;
  }

  static isNull(left, right) {
    return left + ' IS ' + right;
  }

  static isNotNull(left, right) {
    return left + 'IS NOT ' + right;
  }

  static isMissing(field) {
    return field  + ' IS MISSING';
  }

  static isNotMissing(field) {
    return field + ' IS NOT MISSING';
  }

  static isValued(field) {
    return field + ' IS VALUED';
  }

  static isNotValued(field) {
    return field + ' IS NOT VALUED';
  }
}

module.exports = Comparison;
