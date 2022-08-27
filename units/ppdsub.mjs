import assert from 'assert/strict'
import { captureRejectionSymbol } from 'events'

import engine from '../engine.js'

const { expand, raysFrom, jumpCircleAround, ppdSubset } = engine;

const board = expand("1r3kr1/pbpBBp1p/1b3P2/8/8/2P2q2/P4PPP/3R2K1");

const raysFromCenter = raysFrom('e4');

const raysFromCorner = raysFrom('a1');

const jumpsFromCenter = jumpCircleAround('e4');

const jumpsFromCorner = jumpCircleAround('a1');

const centerRays = [
  '11B1', '11p', '111', 'qP1',
  '111', '111', '1111', '11b1'
];

const centerJumps = [ 'P', '1', '1', 'P', '1', 'P' , '1', '1' ];

const cornerRays = [ 'P1111p1', '1P11P11', '11R11K1', '', '', '', '', '' ];

const cornerJumps = [ '1', '1', '', '', '', '' , '', '' ];

const listPP = {
  midBoardFillsAll8Rays() {
    assertWithErrHandling(raysFromCenter, false, centerRays);
  },
  cornerFillsOnly3Rays() {
    assertWithErrHandling(raysFromCorner, false, cornerRays);
  },
  midBoardFillsAll8Jumps() {
    assertWithErrHandling(jumpsFromCenter, true, centerJumps);
  },
  cornerFillsOnly2Jumps() {
    assertWithErrHandling(jumpsFromCorner, true, cornerJumps);
  }
};

export default listPP;

function assertWithErrHandling(input1, input2, expected) {
  const actual = ppdSubset(board, input1, input2);

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
