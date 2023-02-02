const {Enum} = require('@lumjs/core');

/**
 * An Enum of associative values.
 * 
 * @type {object}
 * @prop {number} NONE - No association
 * @prop {number} LEFT - Left associative
 * @prop {number} RIGHT - Right associative
 * @exports module:@lumjs/expressions.ASSOC
 */
module.exports = Enum(['NONE','LEFT','RIGHT']);
