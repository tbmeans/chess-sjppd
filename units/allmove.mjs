import assert from 'assert/strict'
import { captureRejectionSymbol } from 'events'

import engine from '../engine.js'

const { expand, attackMap, getLegalMoves } = engine;

const initMoves = ('b1c3,b1a3,g1h3,g1f3,a2a3,a2a4,b2b3,b2b4,c2c3,c2c4,d2d3' +
  ',' + 'd2d4,e2e3,e2e4,f2f3,f2f4,g2g3,g2g4,h2h3,h2h4'
);

const listAll = {
  initialPositionHasOnlyPawnToDblPushAnd2MovesPerKnight() {
    assertWithErrHandling(
      "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq -",
      attackMap(expand("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR"), 'w'),
      initMoves
    );
  },
  evergreenGameMatePositionHasZeroMoves() {
    assertWithErrHandling(
      "1r3kr1/pbpBBp1p/1b3P2/8/8/2P2q2/P4PPP/3R2K1 b - -",
      attackMap(expand("1r3kr1/pbpBBp1p/1b3P2/8/8/2P2q2/P4PPP/3R2K1"), 'b'),
      ''
    );
  },
  pinnedPawnWithAttackerOutOfReachHasZeroMoves() {
    assertWithErrHandling(
      "8/1b6/8/3P4/4K3/8/8/8 w - -",
      attackMap(expand("8/1b6/8/3P4/4K3/8/8/8"), "w"),
      'e4e5,e4f5,e4f4,e4f3,e4e3,e4d3,e4d4'
    );
  },
  pinAndCheckPinnedPawnZeroMovesAndKingMustGoBetweenCheckRays() {
    assertWithErrHandling(
      "8/1b6/4q3/3P4/4K3/8/8/8 w - -",
      attackMap(expand("8/1b6/4q3/3P4/4K3/8/8/8"), "w"),
      'e4f4,e4f3,e4d3,e4d4'
    );
  },
  getAwayFromPawnCheckOnSameDiagonalButNoCaptureWithAnotherAttackerBehindIt() {
    assertWithErrHandling(
      "8/8/2b5/3p4/4K3/8/8/8 w - -",
      attackMap(expand("8/8/2b5/3p4/4K3/8/8/8"), "w"),
      'e4e5,e4f5,e4f4,e4f3,e4e3,e4d3,e4d4'
    );
  }
};

export default listAll;

function assertWithErrHandling(position, attacksOnKing, expected) {
  const actual = getLegalMoves(position, attacksOnKing);

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
