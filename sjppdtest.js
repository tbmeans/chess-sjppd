import assert from 'assert/strict'

import engine from './engine.js'

const { Position, PositionReport,
  SequenceOfMoves, PGNSevenTagRoster, cpuPlay
} = engine;

/*
{
  f2: {
    pieceOnOrg: 'Q',
    targetSquares: [
      'g2', 'h2', 'g3', 'h4',
      'f3', 'f4', 'e3', 'd4',
      'e2', 'd2', 'c2', 'b2',
      'a2', 'e1', 'f1', 'g1'
    ],
    e3: 'f',
    d4: 'f',
    c2: 'f2',
    f3: '2',
    f4: '2'
  },
  c5: {
    pieceOnOrg: 'Q',
    targetSquares: [
      'd5', 'e5', 'd6', 'e7',
      'f8', 'c6', 'c7', 'c8',
      'b6', 'a7', 'b5', 'a5',
      'b4', 'a3', 'c4', 'c3',
      'c2', 'c1', 'd4', 'e3'
    ],
    e3: 'c',
    d4: 'c',
    c2: 'c5',
    d5: 'c',
    e5: 'c',
    f8: 'c',
    c8: 'c'
  },
  f5: {
    pieceOnOrg: 'Q',
    targetSquares: [
      'g5', 'h5', 'g6', 'h7',
      'f6', 'f7', 'f8', 'e6',
      'd7', 'c8', 'e5', 'd5',
      'e4', 'd3', 'c2', 'b1',
      'f4', 'f3', 'g4', 'h3'
    ],
    c2: 'f5',
    f3: '5',
    f4: '5',
    d5: 'f',
    e5: 'f',
    f8: 'f',
    c8: 'f'
  }
}

let chessNode = new Position('8/8/8/2Q2Q2/8/8/5Q2/8', 'w', '-', '-', 0, '')
let moves = chessNode.getAllMoves();
*/

const g = new ChessGame('visitor', 'cpu');

const movetext = "1. Nf3 Nf6 2. e3 g6 3. b3 Bg7 4. Bb2 O-O 5. g3 c5 \
6. Bg2 d5 7. O-O Nc6 8. d3 d4 9. e4 b6 10. a3 e5 11. b4 Bg4 12. bxc5 bxc5 \
13. Nbd2 Rb8 14. Qb1 Nd7 15. c3 dxc3 16. h3 Rxb2 17. Qxb2 cxb2 18. Rab1 Bxf3 \
19. Bxf3 Nb6 20. d4 Qxd4 21. Rfd1 Qc3 22. Be2 Nd4 23. Rdc1 bxc1=Q+ \
24. Rxc1 Nxe2+ 25. Kf1 Nxc1 26. f4 Rd8 27. fxe5 Rxd2 28. Ke1 Nd3+ \
29. Kf1 Qa1# 0-1";

const movelist = [ "g1f3", "g8f6", "e2e3", "g7g6" ];

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
