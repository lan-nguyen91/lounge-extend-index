'use strict';

// ===============================================================

class Logical {

  constructor () {
  }

  static and (conditions) {
    this._padding = ' ';
    return conditions.join(this._padding + 'AND' + this._padding);
  }

  static or (conditions) {
    this._padding = ' ';
    return conditions.join(this._padding + 'OR' + this._padding);
  }

  static not (conditions) {
    this._padding = ' ';
    return conditions.join(this._padding + 'NOT' + this._padding);
  }
}

module.exports = Logical;
