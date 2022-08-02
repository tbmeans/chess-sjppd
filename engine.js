/** Rank-ascending list of all algebraic notation:
 * a1, b1, c1, ... a2, b2, c2, ... a8, ..., h8
 */
const an64 = Array.from({length: 64}, (v, i) => {
  return "abcdefgh"[i % 8] + ( (i - i % 8) / 8 + 1 );
});

/** Rank-descending list of all algebraic notation:
 * a8, ..., h8, ... , a1, ..., h8,
 * which is the same order as FEN piece placement data.
 */
const an64TopDown = Array.from({length: 64}, (v, i) => {
  return "abcdefgh"[i % 8] + (8 - (i - i % 8) / 8);
});

/** Get color of a piece expressed in Forsyth-Edwards Notation (FEN) piece
 * placement data, in which capital letters indicate white pieces and
 * lowercase indicates black pieces. Returns single-char string "w" or "b"
 *
 * @param {string} s string expression of a chess piece in FEN
 */
const color = s => {
  if ( s.match(/^[BKNPQR]/) ) {
    return 'w';
  }
  if ( s.match(/^[bknpqr]/) ) {
    return 'b';
  }
};

/** Chess position as defined by 5 of 6 fields of Forsyth-Edwards Notation
 * (FEN). Fields of FEN are substrings formed by splitting on space delimiters.
 * Default position constructed is initial position of chess.
 * @constructor
 * @param {string} [piecePlacementData] (PPD) layout of pieces by rank, pieces are single character first letters of name of type of piece, capitalized for white, lowercase for black, empty spaces marked by numbers, compressing consecutive empty squares into digits greater than 1
 * @param {string} [activeColor] (AC) indicates the color of the side that has the move, a single char string 'w' for white or 'b' for black
 * @param {string} [castlingAvailability] (CA) indicates whether each color may castle king/queenside by k and q chars, capital for white, lowercase for black; only indicates availability due to lack of movement/loss of king and rooks from initial position, does not indicate whether king is attacked or if paths are clear; dash indicates no castling availability both black and white
 * @param {string} [enPassantTargetSquare] (EPTS) indicates that an en passant capture is available by listing the square to move to for the capture, dash char for no en passant capture available
 * @param {string} [halfmoveClock] (HMC) count of reversible halfmoves (halfmove is a single turn by white or black) but does include castling which is irreversible; count resets to 0 on pawn move or capture (irreversible)
 * @param {string} [capturesInFEN] string of piece chars in FEN representing pieces no longer in the PPD due to capture.
 */
function Position(piecePlacementData, activeColor, castlingAvailability,
  enPassantTargetSquare, halfmoveClock, capturesInFEN) {
    this.piecePlacementData = (piecePlacementData ||
      'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR'
    );
    this.activeColor = activeColor || 'w';
    this.castlingAvailability = castlingAvailability || 'KQkq';
    this.enPassantTargetSquare = enPassantTargetSquare || '-';
    this.halfmoveClock = halfmoveClock || 0;
    this.capturesInFEN = capturesInFEN || '';
}

Position.prototype.plot = plot;
Position.prototype.nextPosition = movePiece;

/** For purposes of tracking repeatable positions, only the first four fields
 * of FEN are stringified, per application of the FIDE Laws of Chess to FEN.
 */
Position.prototype.toString = function firstFour() {
  return Object.values(this).slice(0, 4).join(' ');
};

Position.prototype.getCapturesInUnicode = function nFEToUnicode() {
  return this.capturesInFEN.split('').map(s => {
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
  }).join('');
};

/**
 * All data relevant to the given position for the progression of the game:
 * * Legal moves list for all active pieces of the chess position is an object keyed by origin square, with members:
 * * * Piece on origin, useful for translating PCN to SAN for the position
 * * * Target square array, useful for translating PCN to SAN for the position
 * * * Common target squares of non-pawn same-type pieces as key to Standard Algebraic Notation (SAN) disambiguation string value
 * * The status of white and black sides for the position based on active color and legal moves. These status could be useful as chess clock captions.
 * * If the position is game termination, the game over reason is given.
 * @constructor
 * @param {Object} position object with the first 5 of 6 fields of FEN as properties.
 */
 function PositionReport(position) {
  const ppd64 = expandReverse(position.piecePlacementData);
  const ac = position.activeColor;
  const ca = position.castlingAvailability;
  const epts = position.enPassantTargetSquare;
  const material = materialSort(ppd64, ac);
  const allAttacks = [];
  const checksAndAbsPins = allConstraints(ppd64, ac, material.oppActive);
  const legalMoves = {};
  const twinSets = { b: [], n: [], q: [], r: [] };
  const areNoDuplicates = arr3 => {
    return arr3[0] != arr3[1] && arr3[0] != arr3[2] && arr3[1] != arr3[2];
  };
  const disambiguation = (commonTargets, a, b) => {
    let da, originsWithCommonTargets, files, ranks, fileNotDupl, rankNotDupl;

    if (a > -1 && b) {
      originsWithCommonTargets = [ twinOrigins[a], twinOrigins[b] ];
    } else {
      originsWithCommonTargets = twinOrigins;
    }

    files = originsWithCommonTargets.map(s => s[0]);
    ranks = originsWithCommonTargets.map(s => s[1]);

    if (a > -1 && b) {
      fileNotDupl = areNoDuplicates(files, a, b);
      rankNotDupl = areNoDuplicates(ranks, a, b);
    } else {
      fileNotDupl = areNoDuplicates(files);
      rankNotDupl = areNoDuplicates(ranks);
    }

    if (fileNotDupl) {
      da = files;
    } else if (rankNotDupl) {
      da = ranks;
    } else {
      da = originsWithCommonTargets;
    }

    commonTargets.forEach(target => {
      return originsWithCommonTargets.forEach( (org, i) => {
        return legalMoves[org][target] = da[i];
      });
    });

    return;
  };
  const inThirdButNotAllThree = s => {
    return (twinTargets[2]?.includes(s) &&
    commonTargets012.includes(s) === false);
  };
  let raysPlus, pieceMatch, pieceType;
  let twinOrigins, twinTargets;
  let commonTargets01, commonTargets02, commonTargets12, commonTargets012;
  let moveCount = 0;
  let madeMoveMsg = "Move made";
  let hasMoveMsg = "Has move";
  let white, whiteIsNSF, black, blackIsNSF, gameOver;

  for (const [ origin ] of material.oppActive) {
    allAttacks.push(
      ...targetsTruncAfter1stPc( raysAndNearestNotOnRay( origin, ppd64 ) )
    );
  }

  // write moves for each active piece
  for (const [origin, pieceOnOrg] of material.active) {
    if (checksAndAbsPins.checks.length > 1
      && pieceOnOrg.match(/k/i) == null) {
        legalMoves[origin] = { pieceOnOrg, targetSquares: [] };
        continue;
    }

    raysPlus = raysAndNearestNotOnRay(origin, ppd64);

    if ( pieceOnOrg.match(/p/i) ) {
      legalMoves[origin] = targetsTruncAfterCaptureOrBeforeActive(
        raysPlus, ac, checksAndAbsPins, ppd64, epts
      );
    } else if ( pieceOnOrg.match(/k/i) ) {
      legalMoves[origin] = targetsTruncAfterCaptureOrBeforeActive(
        raysPlus, ac, allAttacks, ppd64, ca
      );
    } else {
      legalMoves[origin] = targetsTruncAfterCaptureOrBeforeActive(
        raysPlus, ac, checksAndAbsPins, ppd64
      );
    }
  }

  // establish twin data
  for (const org in legalMoves) {
    if ( pieceMatch = legalMoves[org].pieceOnOrg.match(/[bnqr]/i) ) {
      pieceType = pieceMatch[0].toLowerCase();
      twinSets[pieceType][
        twinSets[pieceType].push( {} ) - 1
      ][org] = legalMoves[org].targetSquares;
    }
  }

  /* Analyze twin data. Each twinSets[pcType] is structured
  in a pattern like b: [ {c1: ['b2']}, {f1: ['g2']} ] */
  for (const pcType in twinSets) {
    if (twinSets[pcType].length < 2) {
      continue;
    }

    twinOrigins = twinSets[pcType].map(o => Object.keys(o)[0]);
    twinTargets = twinSets[pcType].map(o => Object.values(o)[0]);
    commonTargets012 = twinTargets[0].filter(s => {
      return twinTargets[1].includes(s) && twinTargets[2]?.includes(s);
    });
    commonTargets01 = twinTargets[0].filter(s => {
      return (twinTargets[1].includes(s) &&
      commonTargets012.includes(s) === false);
    });

    if (commonTargets01.length) {
      disambiguation(commonTargets01, 0, 1);
    }

    if (twinOrigins.length === 2) {
      continue;
    }

    if (commonTargets012.length) {
      disambiguation(commonTargets012);
    }

    commonTargets02 = twinTargets[0].filter(inThirdButNotAllThree);
    commonTargets12 = twinTargets[1].filter(inThirdButNotAllThree);

    if (commonTargets02.length) {
      disambiguation(commonTargets02, 0, 2);
    }

    if (commonTargets12.length) {
      disambiguation(commonTargets12, 1, 2);
    }
  }

  for (const key in legalMoves) {
    if ( key.match(/[a-h][1-8]/) ) {
      moveCount += legalMoves[key].targetSquares.length;
    }
  }

  if (checksAndAbsPins.checks.length) {
    hasMoveMsg = moveCount ? "check" : "checkmate";
  }

  if (ac === 'w') {
    white = hasMoveMsg;
    whiteIsNSF = material.activeIsNSF;
    black = madeMoveMsg;
    blackIsNSF = material.oppActiveIsNSF;
  } else {
    white = madeMoveMsg;
    whiteIsNSF = material.oppActiveIsNSF;
    black = hasMoveMsg;
    blackIsNSF = material.activeIsNSF;
  }

  if (hasMoveMsg === "checkmate") {
    gameOver = [ "Mate:", ac === 'w' ? "black" : "white", "wins" ].join(' ');
  } else if (material.activeIsNSF && material.oppActiveIsNSF) {
    gameOver = "Draw: dead position";
  } else if (position.halfmoveClock >= 50) {
    gameOver = "Draw: 50-move rule";
  } else if (hasMoveMsg !== "check" && moveCount === 0) {
    gameOver = "Draw: stalemate";
  } else {
    gameOver = '';
  }

  this.legalMoves = JSON.parse( JSON.stringify(legalMoves) );
  this.white = white;
  this.whiteIsNSF = whiteIsNSF;
  this.black = black;
  this.blackIsNSF = blackIsNSF;
  this.gameOver = gameOver;
}

PositionReport.prototype.toSAN = toSAN;

/** Creates an object for tracking the progression of a chess game by storing
 * a sequence of moves in both pure coordinate notation (PCN) and the standard
 * algebraic notation (SAN) used in Portable Game Notation (PGN). Includes
 * an initial Position object and initial legalmoves by default.
 * @constructor
 * @param {string} [pcnMoveSeqCsv] Comma-delimited sequence of moves in pure coordinate notation
 */
function SequenceOfMoves(pcnMoveSeqCsv) {
  this.pcnMoveSeqCsv = (pcnMoveSeqCsv || '').toString();
  this.initPosition = new Position;
  this.initStatus = new PositionReport(new Position);
}

SequenceOfMoves.prototype.getMoveSeq = function csvToArray() {
  return this.pcnMoveSeqCsv.length ? this.pcnMoveSeqCsv.split(',') : [];
};

/** Provide a move in Pure Coordinate Notation (PCN) to increment the
 * move sequence. Call this setter then getCurGameStatus() to advance one ply.
 * @param {string} pcn a chess move in pure coordinate notation or a string such as "flag fall," "ff," "time," "resign," or "R" in place of PCN to indicate ending before the side that has the move makes a move.
 */
SequenceOfMoves.prototype.setMoveSeq = function pushMove(pcn) {
  this.pcnMoveSeqCsv = this.getMoveSeq().concat([ pcn ]).join(',');
};

/** Use undoMove() then getCurGameStatus() to go back one move.
 */
SequenceOfMoves.prototype.undoMove = function popMove() {
  this.pcnMoveSeqCsv = this.getMoveSeq().slice(0, -1).join(',');
};

/** Obtains all current position data. Also detects a game over status due to
 * three-fold repetition or a non-move event (flag fall or resignation) as
 * opposed to depending on position alone (check/stalemate, dead position).
 * @returns {Object} either the relevant position data due to the last move that has been made (full FEN with legal moves, capture list, and black and white status, or full FEN with capture list, game over message, and white-n-black status) or just the game over message if the game does not end due to making a move.
 */
SequenceOfMoves.prototype.getCurGameStatus = function runMoves() {
  let pcnSeq = this.getMoveSeq();
  let position = this.initPosition;
  let status = this.initStatus;
  let allTokens = [];
  let repeatables = [];
  let { legalMoves, white, whiteIsNSF, black, blackIsNSF, gameOver } = status;
  let nonMove, san, tokens, movetext, captures, gameTermMarker;

  for (const move of pcnSeq) {
    if ( nonMove = move.match(/^ff|flag fall|T|time|resign|R/i) ) {
      nonMove = nonMove[0];
      this.undoMove(); // Don't want non-move to affect fullmove num.
      pcnSeq = this.getMoveSeq();
      break;
    }

    /* Add SAN for the move to be made */

    san = status.toSAN(move);

    if (white === "Has move") {
      tokens = [
        Math.ceil( (pcnSeq.indexOf(move) + 1) / 2 ),
        '.',
        san
      ];
    } else {
      tokens = [ san ];
    }

    // Record repeatable position due to reversible move
    if (san.match(/^[BKNQR]/) && san.match(/x/) == null &&
      san.match(/[0O]/) == null) {
        repeatables.push( String(position) );
    } else {
      repeatables = [];
    }

    // Make the move
    position = position.nextPosition(move);

    // Update status
    status = new PositionReport(position);
    ({ legalMoves, white, whiteIsNSF, black, blackIsNSF, gameOver } = status);

    if ( [white, black].includes("check") ) {
      tokens.splice(-1, 1, san + '+');
    }

    if ( [white, black].includes("checkmate") ) {
      tokens.splice(-1, 1, san + '#');
    }

    allTokens = allTokens.concat(tokens);
  }

  if (nonMove == null && gameOver.length === 0) {
    movetext = allTokens.join(' ').replace(/ (\.)/g, '$1');
  }

  // captured piece symbols
  captures = position.capturesInFEN;

  // Full FEN
  position = [ String(position), position.halfmoveClock,
    Math.ceil(pcnSeq.length / 2)
  ].join(' ');

  if (nonMove) {
    const isResign = nonMove.match(/^r/i);
    const endName = isResign ? "Resignation:" : "Flag fall:";
    const activeColorIsWhite = position.split(' ')[1] === 'w';
    const oppActiveIsNSF = activeColorIsWhite ? blackIsNSF : whiteIsNSF;
    const oppACWord = activeColorIsWhite ? 'black' : 'white';

    if (isResign || oppActiveIsNSF === false) {
      gameOver = [ endName, oppACWord, "wins" ].join(' ');
      gameTermMarker = oppACWord === "black" ? "0-1" : "1-0";
    } else if (oppActiveIsNSF) {
      gameOver = "Draw: insuff. material";
      gameTermMarker = "1/2-1/2";
    }

    allTokens.push([ gameTermMarker ]);
    movetext = allTokens.join(' ').replace(/ (\.)/g, '$1');

    return JSON.parse(JSON.stringify({
      position, movetext, captures, white, black, gameOver
    }));
  }

  for (let i = 0, p, i2, i3; i < repeatables.length; i++) {
    if (repeatables.length < 9) {
      break;
    }

    p = repeatables[i];
    i2 = repeatables.slice(i + 1).indexOf(p); // look ahead
    i3 = repeatables.slice(i + 1).lastIndexOf(p); // look further

    if (i2 > -1 && i3 > i2) {
      gameOver = "Draw: three-fold rep."
      break;
    }
  }

  if (gameOver) {
    gameTermMarker = gameOver.match(/b.+win/i) ? "0-1" : '';
    gameTermMarker ||= gameOver.match(/w.+win/i) ? "1-0" : '';
    gameTermMarker ||= "1/2-1/2";
    allTokens.push([ gameTermMarker ]);
    movetext = allTokens.join(' ').replace(/ (\.)/g, '$1');

    return JSON.parse(JSON.stringify({
      position, movetext, captures, white, black, gameOver
    }));
  }

  return JSON.parse(JSON.stringify({
    position, movetext, captures, legalMoves, white, black
  }));
};

/**
 * Creates an object which prints a minimal Portable Game Notation export string
 * @param {string} [white] name of the player of white, default, site visitor
 * @param {string} [black] name of the player of black, default, site visitor
 */
function PGNSevenTagRoster(white, black) {
  this.event = '?';
  this.site = '?';
  this.date = ( new Date() ).toJSON().slice(0, 10).replace(/-/g, '.');
  this.round = '?';
  this.white = white || 'visitor';
  this.black = black || 'visitor';
  this.result = '';
}

PGNSevenTagRoster.prototype.toString = function printPGN(movetext) {
  const tagNames = Object.keys(this).map(s => {
	  return s[0].toUpperCase() + s.slice(1);
	});
  const tagValues = Object.values(this);
	const valWrap = s => '"' + s + '"';
	const tags = [];

	for (let i = 0; i < tagNames.length; i++) {
	  tags.push([
      (i === 0 ? '[' : '') + tagNames[i],
      valWrap(tagValues[i]) + (i === tagNames.length - 1 ? ']' : '')
	  ].join(' '));
	}

	return tags.join(']\n[') + '\n\n' + movetext + '\n';
};

/** CHESS ENGINE, for now, returns random move in pure coordinate notation.
 * @param {Object} legalMoves an object in which keys are algebraic notation for
 * origin squares and the values are objects keyed with at least "pieceOnOrg"
 * for a value of the FEN piece on origin square and "targetSquare" for a value
 * of an array of legal move target squares in algebraic notation.
*/
function cpuPlay(legalMoves) {
  const origins = Object.keys(legalMoves);
  const moveable = origins.filter(s => legalMoves[s].targetSquares.length);
  const selectedOrigin = moveable[
    Math.floor( moveable.length * Math.random() )
  ];
  const choices = legalMoves[selectedOrigin].targetSquares;
  const selectedTarget = choices[Math.floor( choices.length * Math.random() )];
  let promotion = legalMoves[selectedOrigin].pieceOnOrg + selectedTarget[1];

  promotion = promotion.match(/p1|P8/) ? 'q' : '';

  return selectedOrigin + selectedTarget + promotion;
}

export default { Position, SequenceOfMoves, PGNSevenTagRoster, cpuPlay };

/** Piece placement data expansion to be used with rank-descending list of
 * all algebraic notations.
 *
 * This is a top-down (rank 8 to 1) left-right (file a to h) representation
 * of the 64-square chessboard as an length 64 array of 1-char notations for
 * either a piece on a square or an empty square. Piece-on-square notation is
 * according to Forsyth-Edwards Notation (FEN) piece placement data, with a
 * single digit '1' representing an empty square.
 *
 * The expansion feature of this function takes digits greater than 1
 * in the piece placement data and converts them into a string of a
 * number of '1' chars equal to the digit greater than 1.
 *
 * @param {string} ppd piece placement data substring from the Forsyth-Edwards
 * Notation (FEN) expression of chess position.
 */
function expand(ppd) {
  return ppd.split('/').join('').replace(
    /[2-8]/g, match => '1'.repeat(match)
  ).split('');
}

/** Piece placement data expansion to be used with rank-ascending / bottom-up
 * list of all algebraic notations.
 * @param {string} ppd piece placement data substring from the Forsyth-Edwards
 * Notation (FEN) expression of chess position.
 */
function expandReverse(ppd) {
  return ppd.split('/').reverse().join('').replace(
    /[2-8]/g, match => '1'.repeat(match)
  ).split('');
}

const castlingSides = new Map();

for (let i = 0; i < 6; i++) {
  castlingSides.set(
    [ 'h1', 'a1', 'h8', 'a8', 'e1', 'e8' ][i],
    [ 'K', 'Q', 'k', 'q', 'KQ', 'kq' ][i]
  );
}

/** Moves a piece on the piece placement data-based array representation of a
 * chessboard.
 * Requires binding to a Position object with first 5 fields of FEN and a string list
 * of captured pieces in FEN as properties and updates those fields and capture
 * list per laws of chess.
 * @param {string} pcn move made, in Pure Coordinate Notation (PCN).
 * @returns {Position} new Position (as opposed to altering the properties of the Position object to which this method is bound).
 */
function movePiece(pcn) {
  const org = pcn.slice(0, 2);
  const tsq = pcn.slice(2, 4);
  const pro = pcn.slice(4);
  const ppd64 = expandReverse(this.piecePlacementData);
  const board = new Map();
  const pcnOfCastlingRook = { e1g1: 'h1f1',
    e1c1: 'a1d1', e8g8: 'h8f8', e8c8: 'a8d8'
  }[pcn];
  const kingOrRookEvent = pcn.match(/[aeh][18]/)?.[0];
  let capturesInFEN = this.capturesInFEN;
  let piecePlacementData = [];
  let activeColor = this.activeColor;
  let castlingAvailability = this.castlingAvailability;
  let enPassantTargetSquare = "-";
  let eptf = pcn.match(/([a-h])2\1[4]|([a-h])7\2[5]/) || '';
  let halfmoveClock;
  let fieldsOfNextPosition;

  // set the pieces on the board
  for (let i = 0; i < 64; i++) {
    board.set(an64[i], ppd64[i]);
  }

  // record captured non-active color piece before overwriting w/ moving piece
  if (board.get(tsq) != 1) {
    capturesInFEN += board.get(tsq);
  }

  // move the active piece
  board.set( tsq, board.get(org) );
  board.set( org, '1' );

  // board adjustments for special types of moves
  if (pcnOfCastlingRook) {
    const org = pcnOfCastlingRook.slice(0, 2);
    const tsq = pcnOfCastlingRook.slice(2, 4);
    board.set( tsq, board.get(org) );
    board.set( org, '1' );
  } else if (pro.length) {
    board.set(tsq, board.get(tsq) === 'P' ? pro.toUpperCase() : pro);
  } else if (board.get(tsq).match(/p/i) && org[0] !== tsq[0] &&
    ppd64[an64.indexOf(tsq)] == 1) {
      const whiteMoved = board.get(tsq) === 'P';
      const rankOfCaptured = whiteMoved ? tsq[1] - 1 : parseInt(tsq[1]) + 1;
      const squareOfCaptured = tsq[0] + rankOfCaptured;
      board.set(squareOfCaptured, '1');
      capturesInFEN += whiteMoved ? 'p' : 'P';
  }

  for ( const s of board.values() ) {
    piecePlacementData.push(s);
  }

  piecePlacementData = piecePlacementData.map( (s, i) => {
    if (i > 0 && i % 8 === 0) {
      return '/' + s;
    }
    return s;
  }).join('').split('/').reverse().join('/').replace(/1{2,8}/g, m => m.length);

  activeColor = activeColor === 'w' ? 'b' : 'w';

  castlingAvailability = castlingAvailability.replace(
    castlingSides.get(kingOrRookEvent), ''
  );

  if (castlingAvailability.length === 0) {
    castlingAvailability = "-";
  }

  if (eptf.length) {
    enPassantTargetSquare = eptf[2] == null ? eptf[1] + 3 : eptf[2] + 6;
  }

  if (ppd64[an64.indexOf(org)].match(/p/i) ||
    capturesInFEN.length > this.capturesInFEN.length) {
      halfmoveClock = 0;
  } else {
    halfmoveClock = this.halfmoveClock + 1;
  }

  fieldsOfNextPosition = JSON.parse(JSON.stringify(
    [ piecePlacementData, activeColor, castlingAvailability,
      enPassantTargetSquare, halfmoveClock ]
  ));

  return new this.constructor(
    ...fieldsOfNextPosition,
    capturesInFEN.toString()
  );
}

/** List squares from an origin square to the end of the board. Square listing pattern is by ray, i.e., by compass point direction, if the piece on origin is a non-knight. If the piece on origin is a knight, squares nearest the origin between rays are listed. Empty lists are returned if no piece on origin. Pieces on squares out from origin are listed as well.
 * @param {string} origin choice of origin square in algebraic notation
 * @param {Array} ppd64 length 64 board representation array based on the piece placement data field of FEN. See expand().
 * @returns {Object} object with members:
 * * origin square;
 * * piece on origin square;
 * * target squares all the way to the end of the board, grouped (using nested arrays) by their compass point directions on the board from origin, or if knight is on origin, grouped (also using nested arrays) by nearest square between rays in counterclockwise order around the origin;
 * * piece placement data portions corresponding to target squares, also directionally grouped.
 */
function raysAndNearestNotOnRay(origin, ppd64) {
  const pieceOnOrg = ppd64[an64.indexOf(origin)];
  const x = fileChar => "abcdefgh".indexOf(fileChar);
  const y = rankChar => rankChar - 1;
  const x0 = x(origin[0]);
  const y0 = y(origin[1]);
  let targetSquares, piecesOnTS;

  if (pieceOnOrg.match(/[bknpqr]/i) == null) {
    targetSquares = [];
  } else if ( pieceOnOrg.match(/n/i) ) {
    // nearest squares between rays
    targetSquares = an64.filter(s => {
      const xdiff = Math.abs(x(s[0]) - x0);
      const ydiff = Math.abs(y(s[1]) - y0);
      return `${xdiff}${ydiff}`.match(/12|21/) != null;
    }).map(s => [ s ]);
  } else {
    const line = i => an64.filter(s => {
      return [
        y(s[1]) === y0, x(s[0]) - x0 === y(s[1]) - y0,
        x(s[0]) === x0, x(s[0]) - x0 === y0 - y(s[1])
      ][i];
    });

    const legalDir = s => {
      switch (s) {
        case 'b':
        case 'B':
          return (o, i) => i % 2 ? o : [];
        case 'k':
        case 'K':
          return o => o.slice(0, 1);
        case 'p':
          return (o, i) => i > 4 ? o.slice(0, 1) : [];
        case 'P':
          return (o, i) => i > 0 && i < 4 ? o.slice(0, 1) : [];
        case 'r':
        case 'R':
          return (o, i) => i % 2 ? [] : o;
      }
    };

    // divide lines into rays and list squares out from origin
    targetSquares = ( Array(8).fill('') ).map( (v, i) => {
      const l = line(i % 4);
      if (i >= 4) {
        return l.slice( 0, l.indexOf(origin) ).map( (v, i, arr) => {
          return arr[arr.length - i - 1]
        });
      }
      return l.slice(l.indexOf(origin) + 1);
    });

    // limit ray listing by legal directions of piece on origin
    if ( pieceOnOrg.match(/[bkpr]/i) ) {
      targetSquares = targetSquares.map( legalDir(pieceOnOrg) );
    }
  }

  if (targetSquares.length === 0) {
    piecesOnTS = Array(8).fill('');
    targetSquares = piecesOnTS.map(s => []);
  } else {
    piecesOnTS = targetSquares.map(o => {
      return o.map(s => ppd64[an64.indexOf(s)]).join('');
    });
  }

  return JSON.parse(JSON.stringify({
    origin, pieceOnOrg, targetSquares, piecesOnTS
  }));
}

/** Render a text chess board to console. Origin squares marked with "o" and target squares marked with an "X".
 * @param {(string|Array)} [origins] a single origin square string in alebraic notation or array of such.
 * @param {Array} [targets] the targetSquares from "rays and nearest not on rays" listing function.
 */
function plot(origins, targets) {
  const idsOfTS = targets?.flat().map( s => an64TopDown.indexOf(s) );
  const topDownPPD64 = expand(this.piecePlacementData);
  const spacedFiles = Array.from('abcdefgh').join('  ');
  let idsOfOrgs;

  if ( Array.isArray(origins) ) {
    idsOfOrgs = origins.map( s => an64TopDown.indexOf(s) );
  } else { // a single origin alg. notation string was entered
    idsOfOrgs = [ origins ].map( s => an64TopDown.indexOf(s) );
  }

  for (let rank, i = 0; i < 64; i++) {
    if (i === 0) {
      console.log();
    }
    if (i % 8 === 0) {
      rank = '87654321'[i / 8] + '  ';
    }
    if (topDownPPD64[i] != 1) {
      rank += topDownPPD64[i];
    } else {
      rank += '.';
    }
    if (idsOfTS != undefined && idsOfTS.includes(i)) {
      rank += 'X ';
    } else if ( idsOfOrgs != undefined && idsOfOrgs.includes(i) ) {
      rank += 'o ';
    } else {
      rank += '  ';
    }
    if (i % 8 === 7) {
      console.log(rank);
    }
    if (i + 1 === 64) {
      console.log('   ' + spacedFiles + '\n');
    }
  }
}

/** Trims the rays of a to-end-of-board squares list to the last square attacked by the piece on the origin along the ray. Intended for pieces of color opposite of the active color.
 * @param {Object} raysPlus an object of lists of origin square, origin piece, target squares from origin to end of board, pieces on targets, see "raysAndNearestNotOnRay"
 * @returns {Array} a flat array list of all target squares attacked by the piece on the origin given in raysPlus
 */
function targetsTruncAfter1stPc(raysPlus) {
  if ( raysPlus.pieceOnOrg.match(/[kn]/i) ) {
    return JSON.parse( JSON.stringify( raysPlus.targetSquares.flat() ) );
  }

  if ( raysPlus.pieceOnOrg.match(/p/i) ) {
    return JSON.parse(JSON.stringify(
      raysPlus.targetSquares.map( (o, i) => i % 4 === 2 ? [] : o ).flat()
    ));
  }

  const attackLength = raysPlus.piecesOnTS.map(s => {
    return s.match(/1*[bknpqr]?/i)[0].length;
  });

  return JSON.parse(JSON.stringify(
    raysPlus.targetSquares.map( (o, i) => o.slice(0, attackLength[i]) ).flat()
  ));
}

/**
 * Separates the length 64 piece placement data array into Maps of active color and opposite color pieces in FEN and counts pieces to see if there is insufficient material to checkmate.
 * @param {Array} ppd64 board representation as array build from expanded PPD
 * @param {string} activeColor FEN field indicating the color of the side that has the move, a single char string 'w' for white or 'b' for black
 * @returns {Object}
 * * Map of active color pieces: each value is the PPD char of the piece on the square indicated by the key in alg. notation
 * * Map of pieces of the opposite of the active color: each value is the PPD char of the piece on the square indicated by the key in alg. notation
 * * Boolean value indicating whether active color side has insufficient material
 * * Boolean value indicating whether the side of the opposite of the active color has insufficient material
 */
function materialSort(ppd64, activeColor) {
  const oppositeOfActiveColor = activeColor === 'w' ? 'b' : 'w';
  const active = new Map();
  const oppActive = new Map();
  const insufficient = [ 'b', 'n', 'bn', 'nb', 'nn' ];
  let activeId;
  let activeIsNSF = false;
  let oppActiveIsNSF = false;
  let materialInFEN = '';

  for (let i = 0; i < 64; i++) {
    if (color(ppd64[i]) === activeColor) {
      active.set(an64[i], ppd64[i]);

      if (activeId == undefined) {
        activeId = an64[i];
      }
    } else if (color(ppd64[i]) === oppositeOfActiveColor) {
      oppActive.set(an64[i], ppd64[i]);
    }
  }

  if (active.size > 3 && oppActive.size > 3) {
    return { active, oppActive, activeIsNSF, oppActiveIsNSF };
  }

  for ( const material of [ active, oppActive ].filter(o => o.size < 4) ) {
    for ( const piece of material.values() ) {
      materialInFEN += piece;
    }

    materialInFEN = materialInFEN.toLowerCase().replace('k', '');

    if ( material.has(activeId) ) {
      activeIsNSF = insufficient.some(s => s === materialInFEN);
    } else {
      oppActiveIsNSF = insufficient.some(s => s === materialInFEN);
    }

    materialInFEN = '';
  }

  return { active, oppActive, activeIsNSF, oppActiveIsNSF };
}

/** Define target square lists for rays of check or absolute pin.
 * @param {string} ppd64 see expand()
 * @param {string} activeColor FEN field indicating the color of the side that has the move, a single char string 'w' for white or 'b' for black
 * @param {Map} oppActiveColorMaterial Map in which keys are origins of pieces of the color opposite the active color.
 * @returns a list of rays along which one piece checks opposite king, and a key-valued list of rays along which a piece is subject to absolute pin, and the origin of the pinned piece is the key.
*/
function allConstraints(ppd64, activeColor, oppActiveColorMaterial) {
  const activeKing = activeColor === 'w' ? 'K' : 'k';
  const byBlack = /(1*([BNPQR]?)1*(K))?/;
  const byWhite = /(1*([bnpqr]?)1*(k))?/;
  const checkOrAbsPin = activeColor === 'w' ? byBlack : byWhite;
  const checks = [];
  const absPins = {};
  let g, m;

  for (const [ origin, pieceOnOrg ] of oppActiveColorMaterial) {
    g = raysAndNearestNotOnRay( origin, ppd64 );

    if ( pieceOnOrg.match(/[np]/i) ) {
      g.piecesOnTS.forEach(s => {
        if (s === activeKing) {
          checks.push( [ origin ] );
        }
      });
      continue;
    }

    /* Checks and absolute pins by distance sliders */
    m = g.piecesOnTS.map( s => s.match(checkOrAbsPin) );

    for (let ray, pinSq, i = 0; i < m.length; i++) {
      // exclude attacked king's square in a copy of slides
      ray = g.targetSquares[i].slice( 0, m[i][0].indexOf(m[i][3]) );

      if (m[i][2]?.length === 1) { // remove & save pinned piece's square
        pinSq = ray.splice(m[i][0].indexOf(m[i][2]), 1)[0];
      }

      // attacked king's allies may capture attacker on list's origin
      ray = [ origin ].concat(ray);

      if (m[i][2]?.length === 1) {
        absPins[pinSq] = ray; // sq. of pinned is pin slides key
      } else if (m[i][1]?.length > 0 && m[i][2]?.length === 0) {
        checks.push(ray);
      }
    }
  }

  return JSON.parse( JSON.stringify( { checks, absPins } ) );
}

/** Adjusts an all-piece-accessible list object "raysPlus" produced by the
 * "rays and nearest not on rays" function to describe the legal moves of a
 * single active color piece of the chess position. Legal move list is a flat
 * array of target square values. Origin and target square pieces also listed.
 * @param {Object} raysPlus key-valued object list of squares and pieces from origin to end of board grouped by direction
 * @param {string} activeColor FEN field indicating the color of the side that has the move, a single char string 'w' for white or 'b' for black
 * @param {Object} constraint a flat array of target squares attacked by all pieces of the same color (produced by looping "targetsTruncAfter1stPc" over a material Map) or an object listing rays of check or absolute pin (see "allConstraints").
 * @param {Array} ppd64 see expand()
 * @param {string} specialMoveFieldOfFEN either en passant target square or castling availability
 */
function targetsTruncAfterCaptureOrBeforeActive( raysPlus, activeColor,
  constraint, ppd64, specialMoveFieldOfFEN ) {

  let { origin, pieceOnOrg, targetSquares, piecesOnTS } = raysPlus;

  if ( pieceOnOrg.match(/p/i) ) {
    const epts = specialMoveFieldOfFEN;
    let push, dirIdx, doublePush;

    targetSquares = targetSquares.map((o, i) => {
      const pcOnTS = piecesOnTS[i];
      const isEmptySq = pcOnTS == 1;
      const captureIsNotAvailable = o !== epts && (
        isEmptySq || o.length === 0 || color(pcOnTS) === activeColor
      );
      switch (i % 4) {
        case 0:
          return o;
        case 2:
          return isEmptySq === false ? [] : o;
        default:
          return captureIsNotAvailable ? [] : o;
      }
    });

    if (push = targetSquares[dirIdx = 2][0] ||
      targetSquares[dirIdx = 6][0] || '') {
        push = dirIdx === 2 ? push.match(/([a-h])3/) : push.match(/([a-h])6/);
        doublePush = push ? push[1] + (dirIdx === 2 ? 4 : 5) : '';
    }

    if (ppd64[an64.indexOf(doublePush)] == 1) {
      targetSquares.push(doublePush);
    }

    targetSquares = targetSquares.flat();

  } else {
    /* Trimming lines of moves to stop on a opposite-color piece
    or to stop on an empty square just before a same-color piece */

    let toCapOrStop, collision, range, trim;

    if ( pieceOnOrg.match(/[bqr]/i) ) {
      toCapOrStop = activeColor === 'w' ? /1*[bknpqr]?/ : /1*[BKNPQR]?/;
    } else {
      toCapOrStop = activeColor === 'w' ? /[bknpqr1]?/ : /[BKNPQR1]?/;
    }

    collision = s => s.match(toCapOrStop)[0];

    if ( pieceOnOrg.match(/[bqr]/i) ) {
      range = piecesOnTS.map(collision).map(s => s.length);
      trim = (o, i) => o.slice(0, range[i]);
    } else { // king or knight
      range = piecesOnTS.map(collision).map(s => {
        if (s.length === 0) {
          return Infinity;
        }
        return 0;
      });
      trim = (o, i) => o.slice(range[i]);
    }

    targetSquares = targetSquares.map(trim).flat();
  }

  if ( pieceOnOrg.match(/k/i) ) {
    const attackedSquares = constraint;
    const sidePattern = activeColor === 'w' ? /K?Q?/ : /k?q?$/;
    const ca = specialMoveFieldOfFEN.match(sidePattern)[0];
    const initRank = activeColor === 'w' ? 1 : 8;

    // Keep only unattacked target squares
    targetSquares = targetSquares.filter(s => attackedSquares.indexOf(s) < 0);

    /* Add castling targets if available */
    if ( ca.match(/k/i)?.[0].length > 0 &&
      targetSquares.includes('f' + initRank) &&
      ppd64[an64.indexOf('f' + initRank)] == 1 &&
      attackedSquares.indexOf('g' + initRank) < 0 &&
      ppd64[an64.indexOf('g' + initRank)] == 1 ) {

      targetSquares.push('g' + initRank);
    }

    if ( ca.match(/q/i)?.[0].length > 0 &&
      targetSquares.includes('d' + initRank) &&
      ppd64[an64.indexOf('d' + initRank)] == 1 &&
      attackedSquares.indexOf('c' + initRank) < 0 &&
      ppd64[an64.indexOf('c' + initRank)] == 1 ) {

      targetSquares.push('c' + initRank);
    }
  } else if (constraint.checks.length > 0 ||
  Object.keys(constraint.absPins).length > 0) {
    if (constraint.checks.length === 1) {
      targetSquares = targetSquares.filter(s => {
        return constraint.checks.flat().includes(s);
      });
    } else if ( Object.keys(constraint.absPins).includes(origin) ) {
      targetSquares = targetSquares.filter(s => {
        return constraint.absPins[origin].includes(s);
      });
    }
  }

  piecesOnTS = targetSquares.map(s => ppd64[an64.indexOf(s)]);

  return JSON.parse(JSON.stringify({
    pieceOnOrg, targetSquares, piecesOnTS
  }));
}

/**
 * Translates pure coordinate notation (PCN) to standard algebraic notation (SAN) using legal moves listing, per FIDE Laws.
 * @param {string} pcn a chess move given in PCN
 * @returns {string} SAN for given chess move
 */
function toSAN(pcn) {
  const castlingData = pcn.match(/e([18])([cg])\1/);
  const isCastling = castlingData != null;

  if (isCastling) {
    return "O-O" + (castlingData[2] === 'c' ? '-O': '');
  }

  const org = pcn.slice(0, 2);
  const tsq = pcn.slice(2, 4);
  const pro = pcn.slice(4);
  const movingPiece = this.legalMoves[org].pieceOnOrg.toUpperCase();
  const tsqIdx = this.legalMoves[org].targetSquares.indexOf(tsq);
  const capturedPiece = this.legalMoves[org].piecesOnTS[tsqIdx];
  let san = '';

  if (movingPiece !== 'P') {
    san += movingPiece + (this.legalMoves[org][tsq] || '');
    san += (capturedPiece != 1 ? 'x' : '') + tsq;
  } else {
    let isPawnCapturing = capturedPiece != 1 || org[0] !== tsq[0];
    san += (isPawnCapturing ? org[0] + 'x' : '') + tsq;
    san += pro ? '=' + pro : '';
  }

  return san;
}
