import assert from 'assert/strict'
import { captureRejectionSymbol } from 'events'

import engine from '../engine.js'

const { expand, attackMap } = engine;

const noAttacks = ( new Array(16) ).fill('');

const egMateAttackMap = noAttacks.slice(0, 10).concat([ 'e7' ]).concat(
  noAttacks.slice(11)
);

const attackOnWhiteMap = [ 'g2:g3,g4,g5,g6,g7,g8' ].concat(
  noAttacks.slice(1, 14)
).concat(
  [ 'f2:e3,d4,c5,b6', '' ]
);

const listAttacks = {
  evergreenGameMateHasOneCheckByAdjacentBishop() {
    assertWithErrHandling(
      expand("1r3kr1/pbpBBp1p/1b3P2/8/8/2P2q2/P4PPP/3R2K1"), "b", null,
      egMateAttackMap
    );
  },
  ifWhiteKingCouldMoveAfterEvergreenMateThenPinned() {
    assertWithErrHandling(
      expand("1r3kr1/pbpBBp1p/1b3P2/8/8/2P2q2/P4PPP/3R2K1"), "w", null,
      attackOnWhiteMap
    );
  },
  ifWhiteKingCouldMoveAfterEvergreenMateCornerMoveUnattacked() {
    assertWithErrHandling(
      expand("1r3kr1/pbpBBp1p/1b3P2/8/8/2P2q2/P4PPP/3R2K1"), "w", 'h1',
      noAttacks
    );
  },
  ableToDetectDiagonalPinsWhenFirstSquareHasPinnedPiece() {
    assertWithErrHandling(
      expand("8/1b6/8/3P4/4K3/8/8/8"), "w", null,
      ( new Array(14) ).fill('').concat([ 'd5:c6,b7', '' ])
    );
  }
};

export default listAttacks;

function assertWithErrHandling(input1, input2, input3, expected) {
  const actual = attackMap(input1, input2, input3);

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
