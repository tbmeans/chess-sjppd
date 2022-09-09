/* instructional credits:
  https://stackify.com/unit-testing-basics-best-practices/
  https://nodejs.org/dist/latest-v16.x/docs/api/assert.html
*/

import assert from 'assert/strict'
import { captureRejectionSymbol } from 'events'

import engine from '../engine.js'

const { color } = engine.units

const tellColor = {
  lowercaseBKNPQRReturnsLowercaseBForBlack() {
    nodejsDotOrgExample('k', 'b');
  },
  uppercaseBKNPQRReturnsLowercaseWForWhite() {
    nodejsDotOrgExample('K', 'w');
  },
  digitReturnsUndefinedColor() {
    nodejsDotOrgExample('1', undefined);
  },
  alphaNotBKNPQRReturnsUndefinedColor() {
    nodejsDotOrgExample('A', undefined);
  }
};

export default tellColor;

function nodejsDotOrgExample(input, expected) {
  const actual = color(input);

  const { message } = new assert.AssertionError({
    actual: actual,
    expected: expected,
    operator: 'deepEqual'
  });

  try {
    assert.deepEqual(actual, expected);
  } catch (err) {
    assert(err instanceof assert.AssertionError);
    assert.deepEqual(err.message, message);
    assert.deepEqual(err.name, 'AssertionError');
    assert.deepEqual(err.actual, actual);
    assert.deepEqual(err.expected, expected);
    assert.deepEqual(err.code, 'ERR_ASSERTION');
    assert.deepEqual(err.operator, 'deepEqual');
    assert.deepEqual(err.generatedMessage, true);
  }
}
