import assert from 'assert/strict'
import { captureRejectionSymbol } from 'events'

import engine from '../engine.js'

const { expand, legalMoves } = engine;

const listMoves = {
  rank1ClearAndBothWhiteCastlingMovesAvailable() {
    assertWithErrHandling(
      'e1', expand("r3k2r/pbpqppbp/np1p2pn/8/8/NP1P2PN/PBPQPPBP/R3K2R"),
      'w', 'KQkq', '-', '', null, 'f1,d1,c1,g1'
    );
  },
  rank8ClearAndBothBlackCastlingMovesAvailable() {
    assertWithErrHandling(
      'e8', expand("r3k2r/pbpqppbp/np1p2pn/8/8/NP1P2PN/PBPQPPBP/R3K2R"),
      'b', 'KQkq', '-', '', null, 'f8,d8,c8,g8'
    );
  },
  withAttackedCastlePathKingCanMakeRegMovesButNotCastle() {
    assertWithErrHandling(
      'e1', expand("6q1/8/8/8/8/8/8/4K2R"), 'w', 'K', '-',
      '', null, 'e2,f2,f1,d1,d2'
    );
  },
  whiteKingNotAllowedToMoveToAdjacentToBlackKing() {
    assertWithErrHandling(
      'd3', expand("8/8/8/4k3/8/3K4/8/8"), 'w', '-', '-',
      '', null, 'e3,e2,d2,c2,c3,c4'
    );
  },
  blackKingNotAllowedToMoveToAdjacentToWhiteKing() {
    assertWithErrHandling(
      'e5', expand("8/8/8/4k3/8/3K4/8/8"), 'b', '-', '-',
      '', null, 'e6,f6,f5,f4,d5,d6'
    );
  },
  pinnedPawnHasNoMovesWhenTooFarFromDiagonalAttacker() {
    assertWithErrHandling(
      'd5', expand("8/1b6/8/3P4/4K3/8/8/8"), 'w', '-', '-',
      "b7,c6", null, ''
    );
  },
  whenKingInCheckAllyInPositionToCaptureMustCapture() {
    assertWithErrHandling(
      'd5', expand("8/8/8/3B4/8/5q2/8/3K4"), 'w', '-', '-',
      'e2,f3', true, 'f3'
    );
  },
  kingCheckedFromDistanceOfTwoPlusSquaresLosesOnlyOneMove() {
    assertWithErrHandling(
      'd1', expand("8/8/8/3B4/8/5q2/8/3K4"), 'w', '-', '-',
      '', true, 'd2,e1,c1,c2'
    );
  }
};

export default listMoves;

function assertWithErrHandling(
  org, ppd64, ac, ca, epts, constraint, isCheck,
  expected
) {
  const actual = legalMoves(org, ppd64, ac, ca, epts, constraint, isCheck);

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
