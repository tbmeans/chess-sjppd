import assert from 'assert/strict'
import { captureRejectionSymbol } from 'events'

import engine from '../engine.js'

const { nextOnDiag } = engine.units

const showNext = {
	validNotationAndIsUpGoesUR() {
		assertWithErrHandling('e4', true, null, 'f5');
	},
	validNotationButNoBooleanGoesDL() {
		assertWithErrHandling('e4', null, null, 'd3');
	},
  validNotationAndIsUpAndIsAntiGoesUL() {
		assertWithErrHandling('e4', true, true, 'd5');
	},
	validNotationAndNotIsUpAndIsAntiGoesDR() {
		assertWithErrHandling('e4', false, true, 'f3');
	},
  validAtBoundaryAndStepOutReturnsInvalidNotation() {
    assertWithErrHandling('a8', true, null, 'b9');
  }
};

export default showNext;

function assertWithErrHandling(input1, input2, input3, expected) {
  const actual = nextOnDiag(input1, input2, input3);

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
