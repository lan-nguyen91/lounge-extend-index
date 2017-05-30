'use strict';

const _ = require('lodash');

class Arithmetic {
  static plus (left, right) {
    return left + '+' + right;
  }

  static minus (left, right) {
    return left + '-' + right;
  }

  static multiply (left, right) {
    return left + '*' + right;
  }

  static divide (left, right) {
    return left + '/' + right;
  }

  static mod (left, right) {
    return left + '%' + right;
  }

  static negaValue (value) {
    return '-' + value;
  }
}

module.exports = Arithmetic;
