const core = require('@lumjs/core');
const {S,N,F,isObj,def} = core.types;

const ASSOC = require('./assoc');
const Builtins = require('./builtins');

function builtIn(name)
{
  return isObj(Builtins[name]) && typeof Builtins[name].evaluate === F; 
}

/**
 * An expression Operator evaluator object
 * @exports module:@lumjs/expressions.Operator
 */
class Operator
{
  constructor (name, opts)
  {
    this.name = name;

    if (opts === true && builtIn(name))
    { // A built-in operator with the same name as the op.
      opts = Builtins[name];
    }
    else if (typeof opts === S && builtIn(opts))
    { // A built-in operator with an explicit name.
      opts = Builtins[opts];
    }
    else if (!isObj(opts))
    { // That's not valid.
      throw new TypeError("invalid operator definition");
    }

    this.operands = (typeof opts.operands === N) 
      ? opts.operands : 2;
    this.precedence = (typeof opts.precedence === N)
      ? opts.precedence : 1;

    if (opts.assoc === false)
    {
      this.assoc = ASSOC.NONE;
    }
    else if (typeof opts.assoc === N)
    {
      this.assoc = opts.assoc;
    }
    else if (typeof opts.assoc === S)
    {
      var assocStr = opts.assoc.substr(0,1).toLowerCase();
      if (assocStr == 'l')
      {
        this.assoc = ASSOC.LEFT;
      }
      else if (assocStr == 'r')
      {
        this.assoc = ASSOC.RIGHT;
      }
      else
      {
        this.assoc = ASSOC.NONE;
      }
    }
    else
    {
      this.assoc = ASSOC.LEFT;
    }

    if (opts.unary)
    {
      if (opts.operands === undefined)
        this.operands = 1;
      if (opts.assoc === undefined)
        this.assoc = ASSOC.RIGHT;
    }

    if (typeof opts.evaluate === F)
    { // Using a custom evaluator.
      this.evaluator = opts.evaluate;
    }
    else if (typeof opts.evaluate === S)
    { // Using a built-in evaluator.
      this.setEvaluator(opts.evaluate.toLowerCase());
    }
    else if (opts.evaluate === true)
    { // Use the name as a built-in evaluator.
      this.setEvaluator(name.toLowerCase());
    }
    else
    {
      console.error({name, opts});
      throw new Error("Invalid evaluator passed to constructor");
    }

  }

  setEvaluator (evaluator)
  {
    if (typeof evaluator === F)
    {
      this.evaluator = evaluator;
    }
    else if (typeof evaluator === S
      && builtIn(evaluator))
    {
      this.evaluator = Builtins[evaluator].evaluate;
    }
    else
    {
      console.error({evaluator});
      throw new Error("Invalid evaluator passed to setEvaluator()");
    }
  }

  evaluate (items)
  {
    if (typeof this.evaluator !== F)
    {
      throw new Error("Attempt to evaluate an operator without a handler");
    }
    if (items.length != this.operands)
    {
      throw new Error("Invalid number of operands in operator evaluation");
    }
    // Now make sure the items are scalar values, not objects.
    var flat = [];
    for (var i = 0; i < items.length; i++)
    {
      var item = items[i];
      if (isObj(item) && typeof item.evaluate === F)
      {
        flat[i] = item.evaluate();
      }
      else
      {
        flat[i] = item;
      }
    }
    // Our items are all flat values, let's do this.
    return this.evaluator(flat);
  }

  leftAssoc ()
  {
    return this.assoc === ASSOC.LEFT;
  }

  rightAssoc ()
  {
    return this.assoc === ASSOC.RIGHT;
  }

  noAssoc ()
  {
    return this.assoc === ASSOC.NONE;
  }

} // class Operator

def(Operator, 'ASSOC',      ASSOC);
def(Operator, 'Builtins',   Builtins);
def(Operator, 'Precedence', require('./precedence'));

module.exports = Operator;
