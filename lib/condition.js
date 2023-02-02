const Operator = require('./operator');

/**
 * An expression Condition object
 * @exports module:@lumjs/expressions.Condition
 */
class Condition
{
  constructor (op, items)
  {
    if (!(op instanceof Operator))
    {
      throw new Error("Condition must be passed Operator");
    }
    if (!Array.isArray(items))
    {
      throw new Error("Condition must be passed an array of Items");
    }
    this.op = op;
    this.items = items;
  }

  evaluate ()
  {
    return this.op.evaluate(this.items);
  }
}

module.exports = Condition;
