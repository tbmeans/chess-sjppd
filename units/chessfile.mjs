import assert from 'assert/strict'
import { captureRejectionSymbol } from 'events'

import engine from '../engine.js'

const { fileSeq } = engine;

const listFile = {
	validNotationAndIsUpReturnsAscendingRay() {
		assertWithErrHandling('f4', true, 'f5,f6,f7,f8');
	},
	validNotationButNoBooleanMakesDescendingRay() {
		assertWithErrHandling('f4', null, 'f3,f2,f1');
	},
  notationAtTopAndIsUpReturnsEmptyNoAscent() {
    assertWithErrHandling('a8', true, '');
  },
  notationAtBottomNoBooleanReturnsEmptyNoDescent() {
    assertWithErrHandling('h1', null, '');
  },
  invalidNotationNotFoundThusEmptyRay() {
    assertWithErrHandling('i9', null, '');
  }
};

export default listFile;

function assertWithErrHandling(input1, input2, expected) {
  const actual = fileSeq(input1, input2);

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
