import assert from 'assert/strict'
import { captureRejectionSymbol } from 'events';

import engine from './engine.js'

const { SequenceOfMoves, PGNSevenTagRoster, cpuPlay } = engine;

const evergreen = "1. e4 e5 2. Nf3 Nc6 3. Bc4 Bc5 4. b4 Bxb4 5. c3 Ba5 6. d4 \
exd4 7. O-O d3 8. Qb3 Qf6 9. e5 Qg6 10. Re1 Nge7 11. Ba3 b5 12. Qxb5 Rb8 13. \
Qa4 Bb6 14. Nbd2 Bb7 15. Ne4 Qf5 16. Bxd3 Qh5 17. Nf6+ gxf6 18. exf6 Rg8 19. \
Rad1 Qxf3 20. Rxe7+ Nxe7 21. Qxd7+ Kxd7 22. Bf5+ Ke8 23. Bd7+ Kf8 24. Bxe7# \
1-0";

let game = new SequenceOfMoves("e2e4,e7e5,g1f3,b8c6,f1c4,f8c5,b2b4,c5b4,\
c2c3,b4a5,d2d4,e5d4,e1g1,d4d3,d1b3,d8f6,e4e5,f6g6,f1e1,g8e7,c1a3,b7b5,b3b5,\
a8b8,b5a4,a5b6,b1d2,c8b7,d2e4,g6f5,c4d3,f5h5,e4f6,g7f6,e5f6,h8g8,a1d1,h5f3,\
e1e7,c6e7,a4d7,e8d7,d3f5,d7e8,f5d7,e8f8,a3e7");

// initial legal moves should be tested on an empty new sequenceofmoves also

let status = game.getCurGameStatus();

let out = {
  "final FEN": status.position,
  "white final status": status.white,
  "black final status": status.black,
  "game over message": status.gameOver,
  "total captures": status.captures,
  "PGN movetext": game.getPGNMovetext()
};

let items = Object.keys(out);

let xpc = [
  "1r3kr1/pbpBBp1p/1b3P2/8/8/2P2q2/P4PPP/3R2K1 b - - 0 24",
  "Move made",
  "checkmate",
  "Mate: white wins",
  'PPppNpNnRpQn'.split('').map(s => {
    return {
      Q: '\u2655',
      R: '\u2656',
      B: '\u2657',
      N: '\u2658',
      P: '\u2659',
      q: '\u265B',
      r: '\u265C',
      b: '\u265D',
      n: '\u265E',
      p: '\u265F'
    }[s];
  }),
  evergreen
];

console.log("Evergreen Game data compared with computed play of Evergreen game.");

for (let message, actual, expected, i = 0; i < items.length; i++) {
  (
    { message } = new assert.AssertionError({
      actual: out[ items[i] ],
      expected: xpc[i],
      operator: 'deepEqual'
    })
  );

  actual = out[ items[i] ];
  expected = xpc[i];

  try {
    assert.deepEqual(actual, expected);
    console.log(items[i] + " computed as intended");
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
