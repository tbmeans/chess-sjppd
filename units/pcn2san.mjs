import assert from 'assert/strict'
import { captureRejectionSymbol } from 'events'

import engine from '../engine.js'

const { expand, attackMap, allMoves,
  nextPosition, disambiguationTable, toSAN
} = engine;

const moveMade = 'a3e7';

let position = '1r3kr1/pbpBnp1p/1b3P2/8/8/B1P2q2/P4PPP/3R2K1 w - - 1';

let [ ppd, ac ] = position.split(' ');

const ppd64 = expand(ppd);

let attacksOnKing = attackMap(ppd64, ac);

let moves = getLegalMoves( position, attacksOnKing );

const daTbl = disambiguationTable( moves, ppd64 );

position = nextPosition(moveMade, position);

[ ppd, ac ] = position.split(' ');

attacksOnKing = attackMap(expand(ppd), ac);

moves = allMoves( position, attacksOnKing );

const convert = {
  notedMovingPieceAndXMarkAndTargetSquareAndHashForEvergreenGameMateMove() {
    assertWithErrHandling(
      moveMade,
      ppd64,
      daTbl,
      attacksOnKing,
      moves,
      'Bxe7#'
    );
  }
};

export default convert;

function assertWithErrHandling(p1, p2, p3, p4, p5, expected) {
  const actual = toSAN(p1, p2, p3, p4, p5)

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
