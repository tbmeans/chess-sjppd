import assert from 'assert/strict'
import { captureRejectionSymbol } from 'events'

import engine from '../engine.js'

const { diagSeq } = engine.units

const listAng = {
  invalidNotationReturnsSame() {
    assertWithErrHandling('i9', null, null, '');
  },
	midBoardIsUpButNoBooleanForIsAntiGoesNE() {
		assertWithErrHandling('e4', true, null, 'f5,g6,h7');
	},
  midBoardNotIsUpAndIsAntiGoesSE() {
		assertWithErrHandling('e4', false, true, 'f3,g2,h1');
	},
	midBoardNotIsUpAndNotIsAntiGoesSW() {
		assertWithErrHandling('e4', null, null, 'd3,c2,b1');
	},
  midBoardIsUpAndIsAntiGoesNW() {
		assertWithErrHandling('e4', true, true, 'd5,c6,b7,a8');
	},
  topLeftCornerAndIsUpButOmitIsAntiForNEGoesNowhere() {
    assertWithErrHandling('a8', true, null, '');
  },
  topLeftCornerNotIsUpAndIsAntiGoesSE() {
    assertWithErrHandling('a8', false, true, 'b7,c6,d5,e4,f3,g2,h1');
  },
  topLeftCornerAndNoBooleansForSWGoesNowhere() {
    assertWithErrHandling('a8', null, null, '');
  },
  topLeftCornerAndIsUpAndIsAntiForNWGoesNowhere() {
    assertWithErrHandling('a8', true, true, '');
  },
  rightEdgeAndIsUpButOmitIsAntiForNEGoesNowhere() {
    assertWithErrHandling('h4', true, null, '');
  },
  rightEdgeNotIsUpAndIsAntiForSEGoesNowhere() {
    assertWithErrHandling('h4', false, true, '');
  },
  rightEdgeAndNoBooleansGoesSW() {
    assertWithErrHandling('h4', null, null, 'g3,f2,e1');
  },
  rightEdgeAndIsUpAndIsAntiGoesNW() {
    assertWithErrHandling('h4', true, true, 'g5,f6,e7,d8');
  }
};

export default listAng;

function assertWithErrHandling(input1, input2, input3, expected) {
  const actual = diagSeq(input1, input2, input3);

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
