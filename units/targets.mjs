import assert from 'assert/strict'
import { captureRejectionSymbol } from 'events'

import engine from '../engine.js'

const { expand, targetsOfAPiece } = engine;

const listTargets = {
  blackPawnOnRank4CanEPOrAdvanceAfterAdjacentWhiteDblPush() {
    assertWithErrHandling(
      'e4', expand("8/8/8/8/3Pp3/8/8/8"), 'd3',
      [ [ 'e3', '', 'd3', '' ], 'p', false ]
    );
  },
  blockedWhitePawnOnEdgeFileWithNoCaptureHasNoMoves() {
    assertWithErrHandling(
      'a2', expand("8/8/8/8/8/b7/P7/8"), '-',
      [ [ '', '', '', '' ], 'P', true ]
    );
  },
  knightCanOnlyMoveToBlanksAndCaptures() {
    assertWithErrHandling(
      'e4', expand("8/8/5p2/8/4N3/6P1/8/8"), '-',
      [ [ 'f6', 'g5', '', 'f2', 'd2', 'c3', 'c5', 'd6' ], 'N', true ]
    );
  },
  bishopCanOnlyMoveToBlanksAndCaptures() {
    assertWithErrHandling(
      'e4', expand("8/1b5p/8/8/4B3/8/6P1/8"), '-',
      [ [ 'f5,g6,h7', 'f3', 'd3,c2,b1', 'd5,c6,b7' ], 'B', true ]
    );
  },
  rookCanOnlyMoveToBlanksAndCaptures() {
    assertWithErrHandling(
      'e4', expand("8/4B3/8/8/1b2r3/8/8/4R3"), '-',
      [ [ 'e5,e6,e7', 'f4,g4,h4', 'e3,e2,e1', 'd4,c4' ], 'r', false ]
    );
  },
  queenCanOnlyMoveToBlanksAndCaptures() {
    assertWithErrHandling(
      'e4', expand('4B3/1b5p/8/8/4q3/8/6P1/4R3'), '-',
      [ [ 'e5,e6,e7,e8', 'f5,g6', 'f4,g4,h4', 'f3,g2', 'e3,e2,e1',
      'd3,c2,b1', 'd4,c4,b4,a4', 'd5,c6' ], 'q', false ]
    );
  },
  kingCanOnlyMoveToBlanksAndCaptures() {
    assertWithErrHandling(
      'e4', expand('8/8/8/3R4/4K3/5q2/8/8'), '-',
      [ [ 'e5', 'f5', 'f4', 'f3', 'e3', 'd3', 'd4', '' ], 'K', true ]
    );
  }
};

export default listTargets;

function assertWithErrHandling(input1, input2, input3, expected) {
  const actual = targetsOfAPiece(input1, input2, input3);

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
