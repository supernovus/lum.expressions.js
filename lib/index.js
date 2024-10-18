const core = require('@lumjs/core');
const {S,isObj,def} = core.types;

const Operator  = require('./operator');
const Condition = require('./condition');

/**
 * Expression Parser library.
 *
 * Fully compatible with Lum.php's implementation.
 * @exports module:@lumjs/expressions
 */
class ExpressionParser 
{
  /**
   * Build a new Expression Parser object.
   * 
   * @param {object} [options] TODO: document this 
   */
  constructor (options)
  {
    this.data      = [];
    this.operators = {};

    if (isObj(options.operators))
    { // An assignment of operators.
      for (let opname in options.operators)
      {
        var opopts = options.operators[opname];
        this.addOperator(opname, opopts);
      }
    }

    if (typeof options.lp === S)
    {
      this.lp = options.lp;
    }
    else
    {
      this.lp = '(';
    }
    if (typeof options.rp === S)
    {
      this.rp = options.rp;
    }
    else
    {
      this.rp = ')';
    }
  }

  addOperator (name, opts)
  {
    if (name instanceof Operator)
    {
      this.operators[name.name] = name;
    }
    else if (typeof name === S)
    {
      this.operators[name] = new Operator(name, opts);
    }
    else
    {
      throw new TypeError("addOperator must be sent a name, or an Operator instance");
    }
  }

  loadInfix (data)
  { // Convert to postfix using Shunting-Yard, then parse that data.
    this.data = [];
    var operators = [];
    var operands = [];
    var len = data.length;
    for (var c = 0; c < len; c++)
    {
      var v = data[c];
      if (v in this.operators)
      { // It's an operator.
        var op = this.operators[v];
        var op2 = operators.length ? operators[operators.length-1] : null;
        while (op2
          && op2 !== this.lp
          && (
            (op.leftAssoc() && op.precedence <= op2.precedence)
            ||
            (op.rightAssoc() && op.precedence < op2.precedence)
          )
        )
        {
          operands.push(operators.pop().name);
          op2 = operators[operators.length-1];
        }
        operators.push(op);
      }
      else if (v === this.lp)
      { // It's a left parenthesis.
        operators.push(v);
      }
      else if (v === this.rp)
      { // It's a right parenthesis.
        while(operators[operators.length-1] !== this.lp)
        {
          operands.push(operators.pop().name);
          if (!operators.length)
          {
            console.error({operators, operands});
            throw new Error("Mismatched parenthesis in first pass");
          }
        }
        operators.pop();
      }
      else
      { // It's an operand.
        operands.push(v);
      }
    }
    while (operators.length)
    {
      var op = operators.pop();
      if (op === this.lp)
      {
        console.error({op, operators, operands});
        throw new Error("Mismatched parenthesis in second pass");
      }
      operands.push(op.name);
    }
    //console.debug("infix to postfix", operands);
    return this.loadPostfix(operands);
  }

  loadPrefix (data)
  {
    this.data = [];
    var len = data.length;
    for (var c = len-1; c >= 0; c--)
    {
      var v = data[c];
      if (v in this.operators)
      { // It's an operator.
        var op = this.operators[v];
        var s = op.operands;
        var z = this.data.length;
        if (z < s)
        {
          throw new Error("Operator "+v+" requires "+s+" operands, only "+z+" found.");
        }
        var substack = this.data.splice(z-s, s).reverse();
        this.data.push(new Condition(op, substack));
      }
      else if (v == this.lp || v == this.rp)
      { // Parens are ignored in prefix.
        continue; 
      }
      else
      { // It's an operand, add it to the stack.
        this.data.push(v);
      }
    }
  }

  loadPostfix (data)
  {
    this.data = [];
    var len = data.length;
    for (var c = 0; c < len; c++)
    {
      var v = data[c];
      if (v in this.operators)
      { // It's an operator.
        var op = this.operators[v];
        var s = op.operands;
        var z = this.data.length;
        if (z < s)
        {
          throw new Error("Operator "+v+" requires "+s+" operands, only "+z+" found.");
        }
        var substack = this.data.splice(z-s, s);
        this.data.push(new Condition(op, substack));
      }
      else if (v == this.lp || v == this.rp)
      { // Parens are ignored in postfix.
        continue;
      }
      else
      { // It's an operand, add it to the stack.
        this.data.push(v);
      }
    }
  }

  getData ()
  { // Return a new array containing our data.
    var data = [];
    for (var i = 0; i < this.data.length; i++)
    {
      data.push(this.data[i]);
    }
    return data;
  }

  saveInfix ()
  {
    var output = [];
    for (var i = 0; i < this.data.length; i++)
    {
      var item = this.data[i];
      this.serialize_infix_item(item, output);
    }
    return output;
  }

  serialize_infix_item (item, output)
  {
    if (item instanceof Condition)
    {
      this.serialize_infix_condition(item, output);
    }
    else
    {
      output.push(item);
    }
  }

  serialize_infix_condition (item, output)
  {
    output.push(this.lp);
    var opn = item.op;
    var ops = item.items.length;
    if (ops == 2)
    {
      this.serialize_infix_item(item.items[0], output);
      output.push(opn.name);
      this.serialize_infix_item(item.items[1], output);
    }
    else if (ops == 1)
    {
      output.push(opn.name);
      this.serialize_infix_item(item.items[0], output);
    }
    else
    {
      throw new Error("Operators in infix expressions must hae only 1 or 2 operands, "+opn.name+" has "+ops+" which is invalid.");
    }
    output.push(this.rp);
  }

  savePrefix ()
  {
    return this.serialize_prefix(this.data, []);
  }

  serialize_prefix (input, output)
  {
    for (var i = 0; i < input.length; i++)
    {
      var item = input[i];
      if (item instanceof Condition)
      {
        output.push(item.op.name);
        this.serialize_prefix(item.items, output);
      }
      else
      {
        output.push(item);
      }
    }
    return output;
  }

  savePostfix ()
  {
    return this.serialize_postfix(this.data, []);
  }

  serialize_postfix (input, output)
  {
    for (var i = 0; i < input.length; i++)
    {
      var item = input[i];
      if (item instanceof Condition)
      {
        this.serialize_postfix(item.items, output);
        output.push(item.op.name);
      }
      else
      {
        output.push(item);
      }
    }
    return output;
  }

  evaluate ()
  {
    if (this.data.length > 1)
    {
      throw new Error("Expression does not parse to a single top item, cannot evaluate.");
    }
    var topItem = this.data[0];
    if (topItem instanceof Condition)
    {
      return topItem.evaluate();
    }
    else
    {
      return topItem;
    }
  }

} // ExpressionParser

def(ExpressionParser, 'Operator',  Operator);
def(ExpressionParser, 'Condition', Condition);

module.exports = ExpressionParser;
