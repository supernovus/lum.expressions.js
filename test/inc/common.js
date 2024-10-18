// The expression parser module
const Exp = require('../../lib/');

// Some super simple test expressions
const basicExps =
{
  postfix:
  [
    1,
    2,
    'gt',
    'not',
    4,
    4,
    'eq',
    'and',
  ],
  prefix:
  [
    'and',
    'not',
    'gt',
    1,
    2,
    'eq',
    4,
    4,
  ],
  infix:
  [
  '(',
    '(',
      'not',
      '(',
        1,
        'gt',
        2,
      ')',
    ')',
    'and',
    '(',
      4,
      'eq',
      4,
    ')',
  ')',
  ],
};

const looseInfix = ['not', 1, 'gt', 2, 'and', 4, 'eq', 4];

const toTypes = Object.keys(basicExps);

function run(t, expConf)
{
  const exp = new Exp(expConf);
  const ops = expConf.operators;

  for (var type in basicExps)
  {
    var exp_in = basicExps[type];
    var meth = 'load'+type[0].toUpperCase()+type.substring(1);
    exp[meth](exp_in);
    t.is(exp.data.length, 1, 'parsed '+type+' to single item');
    t.ok((exp.data[0] instanceof Exp.Condition), 'parsed '+type+' to correct object type');
    t.is(exp.data[0].op.name, 'and', 'parsed '+type+' with correct first child');
    var exp_val = exp.evaluate();
    t.is(exp_val, true, 'evaluated '+type);
    for (var n in toTypes)
    {
      var toType = toTypes[n];
      var meth = 'save'+toType[0].toUpperCase()+toType.substring(1);
      var saved = exp[meth]();
      t.isJSON(saved, basicExps[toType], type+' to '+toType);
    }
  }

  exp.loadInfix(looseInfix);
  t.is(exp.data.length, 1, 'parsed loose infix to single item');
  t.ok((exp.data[0] instanceof Exp.Condition), 'parsed loose infix to correct object type');
  t.is(exp.data[0].op.name, 'and', 'parsed loose infix with correct first child');
  var exp_val = exp.evaluate();
  t.is(exp_val, true, 'evaluated loose infix');
  for (var n in toTypes)
  {
    var toType = toTypes[n];
    var meth = 'save'+toType[0].toUpperCase()+toType.substring(1);
    var saved = exp[meth]();
    t.isJSON(saved, basicExps[toType], 'loose infix to '+toType);
  }

  var false_exp = [1,2,'gt'];
  exp.loadPostfix(false_exp);
  var false_val = exp.evaluate();
  t.is(false_val, false, 'false expression evaluated');

  var num_exp = [1,2,'add',3,'mult'];
  exp.loadPostfix(num_exp);
  var num_val = exp.evaluate();
  t.is(num_val, 9, 'numeric expression evaluated');

  if (ops.negate)
  {
    var neg_exp = [100,'negate'];
    exp.loadPostfix(neg_exp);
    var neg_val = exp.evaluate();
    t.is(neg_val, -100, 'explicitly defined negation operator evaluated');
  }

  if (ops.sqrt)
  {
    var sqrt_exp = [9, 'sqrt'];
    exp.loadPostfix(sqrt_exp);
    var sqrt_val = exp.evaluate();
    t.is(sqrt_val, 3.0, 'custom operator evaluated');
  }
}

module.exports =
{
  basicExps, looseInfix, toTypes, run, Exp, plan: 32,
}
