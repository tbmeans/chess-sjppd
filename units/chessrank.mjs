import assert from 'assert/strict'
import { captureRejectionSymbol } from 'events'

import engine from '../engine.js'

const { rankSeq } = engine.units

const listRank = {
	validNotationAndIsRtGoesRight() {
		assertWithErrHandling('e4', true, 'f4,g4,h4');
	},
	validNotationButNoBooleanGoesLeft() {
		assertWithErrHandling('e4', null, 'd4,c4,b4,a4');
	},
  rightEdgeAndIsRtMakesEmptyRay() {
    assertWithErrHandling('h4', true, '');
  },
  leftEdgeNoBooleanMakesEmptyRay() {
    assertWithErrHandling('a4', null, '');
  },
  invalidNotationNotFoundMakesEmptyRay() {
    assertWithErrHandling('i9', null, '');
  }
};

export default listRank;

function assertWithErrHandling(input1, input2, expected) {
  const actual = rankSeq(input1, input2);

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
