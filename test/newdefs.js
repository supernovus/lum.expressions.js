// Current test count.
const plan = 32;
// A new test instance.
const t = require('@lumjs/tests').new({module, plan});

// A common test suite
const ts = require('./inc/common');

// The new shorter def for built-in operators.
const opDef =
{
  eq: true,
  gt: true,
  and: true,
  not: true,
  add: true,
  mult: true,
  negate: 'neg',
  sqrt: {precedence: 100, unary: true, evaluate: function (items)
  {
    return Math.sqrt(items[0]);
  }},
};

// Run the tests.
ts.run(t, {operators: opDef});

// All done.
t.done();
