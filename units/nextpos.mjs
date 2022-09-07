import assert from 'assert/strict'
import { captureRejectionSymbol } from 'events'

import engine from '../engine.js'

const { nextPosition } = engine;

const getNext = {
  doublePawnPushSetsEnPassantTargetSquare() {
    assertWithErrHandling(
      'e2e4', "8/8/8/8/5p2/8/4P3/8 w - - 0",
      "8/8/8/8/4Pp2/8/8/8 b - e3 0,"
    );
  },
  enPassantTakenRecordsCapturedPiece() {
    assertWithErrHandling(
      'f4e3', "8/8/8/8/4Pp2/8/8/8 b - e3 0",
      "8/8/8/8/8/4p3/8/8 w - - 0,P"
    );
  },
  movingWhiteKingClearsWhiteCastlingAvailaibilityOnly() {
    assertWithErrHandling(
      'e1f1', "r3k2r/pbpqppbp/np1p2pn/8/8/NP1P2PN/PBPQPPBP/R3K2R w KQkq - 0",
      "r3k2r/pbpqppbp/np1p2pn/8/8/NP1P2PN/PBPQPPBP/R4K1R b kq - 1,"
    );
  },
  movingBlackQueensRookClearsOnlyBlackQueensideAvailability() {
    assertWithErrHandling(
      'a8b8', "r3k2r/pbpqppbp/np1p2pn/8/8/NP1P2PN/PBPQPPBP/R4RK1 b kq - 1",
      "1r2k2r/pbpqppbp/np1p2pn/8/8/NP1P2PN/PBPQPPBP/R4RK1 w k - 2,"
    );
  },
  castlingMovesBothKingAndRookAndClearsBothSidesAvailability() {
    assertWithErrHandling(
      'e1g1', "r3k2r/pbpqppbp/np1p2pn/8/8/NP1P2PN/PBPQPPBP/R3K2R w KQkq - 0",
      "r3k2r/pbpqppbp/np1p2pn/8/8/NP1P2PN/PBPQPPBP/R4RK1 b kq - 1,"
    );
  },
  moveWithPawnPromotionSelectionReplacesPawnWithSelectedPiece() {
    assertWithErrHandling(
      'g7h8q', "rnbqkb1r/ppppppPp/5n2/8/8/8/PPPPPPP1/RNBQKBNR w KQkq - 1",
      "rnbqkb1Q/pppppp1p/5n2/8/8/8/PPPPPPP1/RNBQKBNR b KQq - 0,r"
    );
  }
};

export default getNext;

function assertWithErrHandling(pcn, position, expected) {
  const actual = nextPosition(pcn, position);

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
