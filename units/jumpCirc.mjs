import assert from 'assert/strict'
import { captureRejectionSymbol } from 'events'

import engine from '../engine.js'

const { jumpCircleAround } = engine;

const listJumps = {
  invalidNotationReturnsEmpty() {
    assertWithErrHandling('i9', '');
  },
	midboardSquareReturnsFullSet() {
		assertWithErrHandling('e4', 'f6,g5,g3,f2,d2,c3,c5,d6');
	},
  listForBottomLeftCornerStartsWith2JumpsRestEmpty() {
		assertWithErrHandling('a1', 'b3,c2,,,,,,');
	},
	adjToBottomLeftCornerLists3JumpsInMiddleRestEmpty() {
		assertWithErrHandling('b8', ',,d7,c6,a6,,,');
	},
  listForMidrightEdgeIs4JumpsAtEndRestEmpty() {
    assertWithErrHandling('h4', ',,,,g2,f3,f5,g6')
  },
  oneSqUpFromBottomMidboardLists6JumpsWith2EmptyInMiddle() {
    assertWithErrHandling('d2', 'e4,f3,f1,,,b1,b3,c4')
  }
};

export default listJumps;

function assertWithErrHandling(input, expected) {
  const actual = jumpCircleAround(input).join(',');

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
