// Current test count.
const plan = 32;
// A new test instance.
const t = require('@lumjs/tests').new({module, plan});

// A common test suite
const ts = require('./inc/common');

// The classic defs from the original JS and PHP libs.
// These pre-date the new defs being available.
const opDef =
{
  eq: {precedence: 3, evaluate: true},
  gt: {precedence: 3, evaluate: true},
  and: {precedence: 1, evaluate: true},
  not: {precedence: 2, unary: true, evaluate: true},
  add: {precedence: 2, evaluate: true},
  mult: {precedence: 3, evaluate: true},
  negate: {precedence: 4, unary: true, evaluate: 'neg'},
  sqrt: {precedence: 4, unary: true, evaluate: function (items)
  {
    return Math.sqrt(items[0]);
  }},
};

// Run the tests.
ts.run(t, {operators: opDef});

// All done.
t.done();

