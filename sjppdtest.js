import assert from 'assert/strict'

import ChessPosition from './movegen.js'

import ChessGame from './game.js'

import ChessMove from './movedata.js'

import cpuPlay from './engine.js'

const p = new ChessPosition();

const g = new ChessGame(p, 'user', 'cpu');

const org = { ppdIdx: 52, nA: "e2", nFE: "P" };

const dest = { ppdIdx: 36, nA: "e4", nFE: "1" };

const m = new ChessMove(org, dest, "Q");

const ri = parseInt( 64 * Math.random() );

const rx = parseInt( 8 * Math.random() );

const ry = parseInt( 8 * Math.random() );

const sjppdKing = {
  sjpd2pc: '............f.......f...a...f....a..f..d..axfxd...XAFDX...LLoLL.',
  ppd: 'rnbqkbnrpppppppp' + '1'.repeat(32) + 'PPPPPPPPRNBQKBNR',
  merge() {
    const arr = [];
    for (let i = 0; i < 64; i++) {
      arr[i] = this.sjpd2pc[i] + this.ppd[i];
    }
    return arr;
  }
}

let out = {
  "ppd of length 64": p.ppdLength64NoSlashChars,
  "ppd index from pos. int. under 64": p.toPpdIdx(ri),
  "ppd index from x & y on chessboard": p.toPpdIdx(rx, ry),
  "ppd index from x alone": p.toPpdIdx(rx),
  "ppd index from y alone": p.toPpdIdx(undefined, ry),
  "ppd index from alg. notation": p.toPpdIdx("abcdefgh"[rx] + "12345678"[ry]),
  "ppd index from alg. notation 2nd in param list": p.toPpdIdx(
    undefined, "abcdefgh"[rx] + "12345678"[ry]
  ),
  "chessboard x & y from ppd index": p.toChessCartesian(ri),
  "chessboard x & y fr. alg. notation": p.toChessCartesian(
    "abcdefgh"[rx] + "12345678"[ry]
  ),
  "sjpd on top left square": p.slideAndJumpPlacementData(0),
  "sjpd on white king init square": p.sjToActiveKing,
  "sjppd on white king init square": p.sjppdOnActiveKing,
  "rays to white king on init square": p.raysOnActiveKing,
  "check rays to white king on init": p.eventRays(p.sjppdOnActiveKing, "check"),
  "knight attacking king at init": p.sjppdOnActiveKing.indexOf('x' + p.inactiveKnightFE) > -1,
  "white king in check if in range of init black": p.isNotAttacked(16),
  "king legal moves at init": p.kingLegalMoves,
  "white pawn legal moves at init": p.pawnLegalMoves(52),
  "white knight legal moves at init": p.knightLegalMoves(57),
  "white rook legal moves at init": p.bqrLegalMoves(56),
  "initial all moves string": p.allMovesStr,
  "result of 1. e4": p.resultOfMoves([m]).inFEN
};

let items = Object.keys(out);

let xpc = [
  sjppdKing.ppd,
  ri,
  56 - 8 * ry + rx,
  rx,
  ry,
  56 - 8 * ry + rx,
  56 - 8 * ry + rx,
  [ ri % 8, 7 - parseInt(ri / 8) ],
  [ rx, ry ],
  'olllllllfax.....fxa.....f..a....f...a...f....a..f.....a.f......a',
  sjppdKing.sjpd2pc,
  sjppdKing.merge(),
  [
    { ray: [ 'DP', 'd1', 'd1' ], slides: [ 53, 46, 39 ] },
    { ray: [ 'FP', 'f1', 'f1', 'f1', 'f1', 'fp' ], slides: [ 52, 44, 36, 28, 20, 12 ] },
    { ray: [ 'AP', 'a1', 'a1', 'a1' ], slides: [ 51, 42, 33, 24 ] },
    { ray: [ 'LQ', 'LB' ], slides: [ 59, 58 ] },
    { ray: [], slides: [] },
    { ray: [], slides: [] },
    { ray: [], slides: [] },
    { ray: [ 'LB', 'LN' ], slides: [ 61, 62 ] }
  ],
  [ [], [], [], [], [], [], [], [] ],
  false,
  false,
  [],
  [ 44, 36 ],
  [ 40, 42 ],
  [],
  JSON.stringify(
    [
      [], [], [], [], [], [], [], [],
      [], [], [], [], [], [], [], [],
      [], [], [], [], [], [], [], [],
      [], [], [], [], [], [], [], [],
      [], [], [], [], [], [], [], [],
      [], [], [], [], [], [], [], [],
      ['a3', 'a4'], ['b3', 'b4'], ['c3', 'c4'], ['d3', 'd4'],
      ['e3', 'e4'], ['f3', 'f4'], ['g3', 'g4'], ['h3', 'h4'],
      [], ['a3', 'c3'], [], [], [], [], ['f3', 'h3'], []
    ]
  ),
  "rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3"
];

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
