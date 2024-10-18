const {L_INV,L_ALT,C_REG,M_AS,M_MD,M_NEG} = require('./precedence');

/**
 * Built-in Operator definitions
 * 
 * @exports module:@lumjs/expressions.Operator.Builtins
 */
module.exports =
{
  not:
  { 
    precedence: L_INV,
    unary: true,
    evaluate(items)
    {
      return !(items[0]);
    },
  },

  eq:
  {
    precedence: C_REG,
    evaluate(items)
    {
      return (items[0] == items[1]);
    },
  },

  ne: 
  {
    precedence: C_REG,
    evaluate(items)
    {
      return (items[0] != items[1]);
    },
  },

  gt: 
  {
    precedence: C_REG,
    evaluate(items)
    {
      return (items[0] > items[1]);
    },
  },

  lt:
  { 
    precedence: C_REG,
    evaluate(items)
    {
      return (items[0] < items[1]);
    },
  },

  gte: 
  {
    precedence: C_REG,
    evaluate(items)
    {
      return (items[0] >= items[1]);
    },
  },

  lte:
  { 
    precedence: C_REG,
    evaluate(items)
    {
      return (items[0] <= items[1]);
    },
  },

  and: 
  {
    precedence: L_ALT,
    evaluate(items)
    {
      return (items[0] && items[1]);
    },
  },

  or:
  { 
    precedence: L_ALT,
    evaluate(items)
    {
      return (items[0] || items[1]);
    },
  },

  xor: 
  {
    precedence: L_ALT,
    evaluate(items)
    {
      return (items[0] ? !items[1] : items[1]);
    },
  },

  add: 
  {
    precedence: M_AS,
    evaluate(items)
    {
      return (items[0] + items[1]);
    },
  },

  sub: 
  {
    precedence: M_AS,
    evaluate(items)
    {
      return (items[0] - items[1]);
    },
  },

  mult: 
  {
    precedence: M_MD,
    evaluate(items)
    {
      return (items[0] * items[1]);
    },
  },

  div:
  {
    precedence: M_MD,
    evaluate(items)
    {
      return (items[0] / items[1]);
    },
  },

  neg: 
  {
    precedence: M_NEG,
    unary: true,
    evaluate(items)
    {
      return (items[0] * -1);
    },
  },

}
