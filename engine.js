/** Rank-ascending list of all algebraic notation:
 * a1, b1, c1, ... a2, b2, c2, ... a8, ..., h8
 */
const an64 = Object.freeze(
  Array.from(
    {length: 64},
    (v, i) => "abcdefgh"[i % 8] + "12345678"[(i - i % 8) / 8]
  )
);

/**
 * Produces an array form of piece placement data (PPD) from chess position in Forsyth-Edwards Notation (FEN), where each char in PPD, digits converted into '1' chars, is an array element. Features option to order rank-ascending, to best represent a board of moveable pieces, or rank-descending, for printing a text representation of a chessboard to console.
 * @param {string} ppd first space-delimited substring from FEN chess position
 * @param {boolean} isRankDescending choose order of PPD chars in array
 * @returns FEN piece placement data without rank delimiters and with digits greater than 1 replaced by a string of 1s of length equal to digit, for a sequence of 64 single character strings representing either a piece on a square or an empty square
 */
const expand = (ppd, isRankDescending) => {
  const descendRank = ppdRank => ppdRank;
  const ascendRank = (r, i, ranks) => ranks[7 - i];
  const order = isRankDescending ? descendRank : ascendRank;
  const onesString = match => '1'.repeat(match);

  return Object.freeze(
    ppd.replace(/\d/g, onesString).split('/').map(order).join('').split('')
  );
};

/**
 * Given a square, get the FEN of the piece on it.
 * @param {string} square algebraic notation of the square that you want to know the piece on
 * @param {Array} ppd64 sequence of 64 single character strings representing either a piece on a square or an empty square, in FEN
 * @returns the piece in FEN on the given square but if the square is not valid algebraic notation, empty string is returned
 */
const getPieceOn = (square, ppd64) => ppd64[an64.indexOf(square)] || '';

/**
 * Get color of a piece expressed in Forsyth-Edwards Notation (FEN) piece placement data, in which capital letters indicate white pieces and lowercase indicates black pieces.
 * @param {string} s string expression of a chess piece in FEN
 * @returns single-char string "w" or "b"
 */
const color = s => {
  if ( s.match(/^[BKNPQR]/) ) {
    return 'w';
  }
  if ( s.match(/^[bknpqr]/) ) {
    return 'b';
  }
};

/**
 * List algebraic notation of squares from start to end of board, up or down ranks
 * @param {string} n algebraic notation of a square to start the sequence
 * @param {boolean} isUp choice of whether the next goes up in rank or down
 * @returns comma-separated list of algebraic notation in sequence after given start square to the chessboard boundary in the given rank direction--note that start square is not included, and if next in sequence does not exist due to boundary, returns empty string
 */
const fileSeq = (startSquare, isUp) => {
  return an64.filter(n => {
    return ( n[0] === startSquare[0] &&
      (isUp ? n[1] > startSquare[1] : n[1] < startSquare[1])
    );
  }).map( (n, i, seq) => isUp ? n : seq[seq.length - 1 - i] ).join(',');
};

/**
 * List algebraic notation of squares from start to end of board, left or right across files
 * @param {string} n algebraic notation of a square to start the sequence
 * @param {boolean} isRt choice of whether the next goes right or left in file sequence by alpha
 * @returns comma-separated list of algebraic notation in sequence after given start square to the chessboard boundary in the given file direction--note that start square is not included, and if next in sequence does not exist due to boundary, returns empty string
 */
const rankSeq = (startSquare, isRt) => {
  return an64.filter(n => {
    const isAlphaRt = n.charCodeAt() > startSquare.charCodeAt();
    const isAlphaLt = n[0] < startSquare[0];
    return n[1] === startSquare[1] && (isRt ? isAlphaRt : isAlphaLt);
  }).map( (n, i, seq) => isRt ? n : seq[seq.length - 1 - i] ).join(',');
};

/**
 * Step along a chessboard anti/diagonal
 * @param {string} n algebraic notation of a square to start the sequence
 * @param {boolean} isUp choice of whether the next goes up in rank or down
 * @param {boolean} isAnti choice of whether we want the next square on the anti-diagonal or diagonal
 * @returns algebraic notation of the next square in sequence along a chessboard anti/diagonal as indicated by params
 */
const nextOnDiag = (n, isUp, isAnti) => {
  return ( String.fromCharCode( n.charCodeAt() +
    (isAnti ? -1 : 1) * (isUp ? 1 : -1) ) +
    String.fromCharCode( n.charCodeAt(1) + (isUp ? 1 : -1) )
  );
};

const castlingSides = Object.freeze(new Map([
  [ 'h1', 'K' ],
  [ 'a1', 'Q' ],
  [ 'h8', 'k' ],
  [ 'a8', 'q' ],
  [ 'e1', 'KQ' ],
  [ 'e8', 'kq' ]
]));

/**
 * List the squares of any diagonal ray on chessboard in algebraic notation
 * @param {string} n algebraic notation of a square to start the sequence
 * @param {boolean} isUp choice of whether the sequence goes up or down in rank along the anti/diagonal
 * @param {boolean} isAnti choice of whether the sequence is on the anti-diagonal or diagonal
 * @returns comma-separated list of algebraic notation in sequence from given start square to the chessboard boundary in the given anti/diagonal direction--note that start square IS included and if sequence goes out of bounds beyond start square, the lone start square is returned back
 */
 function diagSeq(n, isUp, isAnti) {
  const fileStop = isUp && !isAnti || !isUp && isAnti ? 'h' : 'a';
  const rankStop = isUp ? 8 : 1;
  if (n.slice(-2, -1) === fileStop || n.slice(-1) == rankStop ||
    n.match(/[a-h][1-8]/) == null) {
      return n;
  }
  return n + ',' + diagSeq(nextOnDiag(n, isUp, isAnti), isUp, isAnti);
}

/**
 * Chessboard rays as sequences of algebraic notation
 * @param {string} origin algebraic notation of the square from which chessboard square sequence rays emanate
 * @returns 8 comma-delimited strings representing each chessboard square sequence ray out from the origin, in order clockwise from north/12'o'clock
 */
function raysFrom(origin) {
  return Object.freeze([
    fileSeq(origin, true),
    diagSeq(origin, true).slice(3),
    rankSeq(origin, true),
    diagSeq(origin, false, true).slice(3),
    fileSeq(origin),
    diagSeq(origin).slice(3),
    rankSeq(origin),
    diagSeq(origin, true, true).slice(3)
  ]);
}

/**
 * Get a set of all jump moves from a given square in a same order for listing slide rays
 * @param {string} origin a square serving as the center of a circle/cross of knight moves
 * @returns list of all jump target squares from a given origin, in clockwise order from north/zero-azimuth/12'o'clock, and if out of bounds in a direction, empty string
 */
function jumpCircleAround(origin) {
  if (origin.match(/[a-h][1-8]/) == null) {
    return Object.freeze([]);
  }

  const diffs = Object.freeze(an64.map(n => {
    const inFile = n.charCodeAt() - origin.charCodeAt();
    const inRank = n[1] - origin[1];
    return `${inFile}${inRank}`;
  }));

  return Object.freeze([
    "12", "21", "2-1", "1-2",
    "-1-2", "-2-1", "-21", "-12"
  ].map(s => an64[diffs.indexOf(s)] || ''));
}

/**
 * Regex patterns to identify an arrangement of pieces in FEN along a ray as check, pin, or target square attack
 * @param {string} activeColor the color of pieces whose moves are constrained by attacks from opposite color pieces
 * @param {boolean} isForKingsOriginSquare truthy value selects regex to detect check and pin, falsy value or lack of value selects regex to detect target square attack
 * @returns three regex for matching FEN piece sequences along chessboard rays of squares, first for rank and file rays, second for diagonal rays above the origin, third for diagonal rays below the origin
 */
function rayAttackPatterns(activeColor, isForKingsOriginSquare) {
  if (activeColor === 'w') {
    if (isForKingsOriginSquare) {
      return Object.freeze({
        rankfilePattern: /^1*[BNPQR]?1*[qr]/,
        diagAbovePattern: /^p|^1*[BNPQR]?1*[bq]/,
        diagBelowPattern: /^1*[BNPQR]?1*[bq]/
      });
    }
    return Object.freeze({
      rankfilePattern: /^k|^K?1*[qr]/,
      diagAbovePattern: /^[kp]|^K?1*[bq]/,
      diagBelowPattern: /^k|^K?1*[bq]/
    });
  }

  if (activeColor === 'b') {
    if (isForKingsOriginSquare) {
      return Object.freeze({
        rankfilePattern: /^1*[bnpqr]?1*[QR]/,
        diagAbovePattern: /^1*[bnpqr]?1*[BQ]/,
        diagBelowPattern: /^P|^1*[bnpqr]?1*[BQ]/
      });
    }
    return Object.freeze({
      rankfilePattern: /^K|^k?1*[QR]/,
      diagAbovePattern: /^K|^k?1*[BQ]/,
      diagBelowPattern: /^[KP]|^k?1*[BQ]/
    });
  }
}

/**
 * Subsets of piece placement data, collecting either all pieces along each chessboard ray of squares out from an origin square or all pieces that are a knight's jump away from an origin square.
 * @param {Array} ppd64 sequence of 64 single character strings representing either a piece on a square or an empty square, in FEN
 * @param {Array} squares array of 8 comma-delimited strings representing each chessboard square sequence ray out from the origin or each square you can jump to from origin, in order clockwise from north/12'o'clock
 * @returns array of 8 comma-delimited strings with the sequence of pieces in FEN out from the origin per ray or jump direction, correpsonds to input {@link squares}
 */
function ppdSubset(ppd64, squares) {
  return Object.freeze(
    squares.map(squaresInDirection => {
      return squaresInDirection.split(',').map(n => {
        return getPieceOn(n, ppd64);
      }).join('');
    })
  );
}

/**
 * Piece placement data mapping ray attacks
 * @param {Array} piecesOnRaySquares a subset of PPD, listing pieces along each ray out from an origin
 * @param {Object} rayAttackPatterns a collection of regex patterns representing check, absolute pin, or square attack along rays according to the specs of the namesake function
 * @returns PPD subset arranged the same as {@link piecesOnRaySquares} but each ray is trimmed at the square of attacking piece
 */
function trimToRayEvent(piecesOnRaySquares, rayAttackPatterns) {
  return Object.freeze(
    piecesOnRaySquares.map( (s, i) => {
      switch(i) {
        case 1:
        case 7:
          return (s.match(rayAttackPatterns.diagAbovePattern) || [ '' ])[0];
        case 3:
        case 5:
          return (s.match(rayAttackPatterns.diagBelowPattern) || [ '' ])[0];
        default:
          return (s.match(rayAttackPatterns.rankfilePattern) || [ '' ])[0];
      }
    })
  );
}

/**
 * Piece placement data mapping jump attacks
 * @param {Array} piecesOnJumpSquares subset of piece placement data, collecting all pieces that are a knight's jump away from an origin square
 * @param {String} enemyKnightFEN the FEN char of whichever color knight may attack given current active color
 * @returns PPD subset arranged the same as {@link piecesOnJumpSquares} but with empty strings wherever a knight does not occupy a jump target in addition to the empty strings indicating out of bounds, and so the only pieces listed are knights occupying a square from which said knight could jump to origin.
 */
function trimToJumpEvent(piecesOnJumpSquares, enemyKnightFEN) {
  return Object.freeze(piecesOnJumpSquares.map(s => {
    return s === enemyKnightFEN ? s : '';
  }));
}

/**
 * List rays of squares and single squares from which an origin is attacked.
 * @param {Array} ppd64 sequence of 64 single character strings representing either a piece on a square or an empty square, in FEN
 * @param {string} ac active color i.e. the color of pieces whose moves are constrained by attacks from opposite color pieces
 * @param {string} square the square that is potentially attacked, in algebraic notation, assumed to be the king's square if not provided
 * @returns an array of CSV strings of algebraic notation sequences: even-indexed strings are rays of sliding check on king, absolute pin of a piece to king, or attack on a non-king-occupied square; odd-indexed strings are single squares of jump attack; index 0 denotes the north direction on chessboard and following indices go clockwise around the compass points.
 */
function attackMap(ppd64, ac, square) {
  const org = square ?? an64[ppd64.indexOf(ac === 'w' ? 'K' : 'k')];
  const rays = raysFrom(org);
  const jumps = jumpCircleAround(org);
  const rayAttacks = trimToRayEvent(
    ppdSubset(ppd64, rays),
    rayAttackPatterns(ac, square == null)
  );
  const jumpAttacks = trimToJumpEvent(
    ppdSubset(ppd64, jumps),
    ac === 'w' ? 'n' : 'N'
  );

  if (rayAttacks.every(o => o == null) &&
    jumpAttacks.indexOf(enemyKnight) === -1) {

    return Object.freeze( Array.from({length: 16}, v => '') );
  }

  const squaresOfJumpAttacks = Object.freeze(
    jumpAttacks.map( (s, i) => {
      return s.length > 0 ? jumps[i] : '';
    })
  );

  // get squares matching ray event trim
  const squaresOfRayAttacks = Object.freeze(rayAttacks.map( (s, i) => {
    const absPin = s.match(/1*([bnpqr])1*[bqr]/i);

    // if not abs. pin map to squares corres. to pieces length
    if (absPin == null) {
      return rays[i].slice(0, 3 * (s.length || 1/3) - 1);
    }

    const idxOfPinned = s.indexOf(absPin[1]);
    const pinnedOn = rays[i].split(',')[idxOfPinned];
    const omitPinned = n => n !== pinnedOn;

    return [
      pinnedOn,
      rays[i].split(',').slice(0, s.length).filter(omitPinned).join(',')
    ].join(':');
  }));

  // interweave rays and jumps clockwise for 16 total directions mapped
  return Object.freeze(
    squaresOfRayAttacks.concat(squaresOfJumpAttacks).map( (o, i, data) => {
      if (i === 0) {
        return o;
      }
      if (i % 2) {
        return data[data.length / 2 + i - Math.ceil(i / 2)];
      }
      if (i % 2 === 0) {
        return data[i - Math.ceil(i / 2)];
      }
    })
  );
}

/**
 * Squares to which a given piece may legally move before consideration of check and absolute pin
 * @param {string} origin square in algebraic notation
 * @param {Array} ppd64 sequence of 64 single character strings representing either a piece on a square or an empty square, in FEN
 * @param {string} epts en passant target square from FEN (in algebraic notation)
 * @returns comma-separated lists of target squares in algebraic notation per direction of legal movement, the piece on origin, and whether that piece is white
 */
function targetsOfAPiece(origin, ppd64, epts) {
  const pieceOnOrg = getPieceOn(origin, ppd64);
  const pieceIsWhite = color(pieceOnOrg) === 'w';
  const rays = raysFrom(origin);
  const pushes = rays[pieceIsWhite ? 0 : 4].slice(0, 5);
  const orgIsOnInitRank = origin[1] == (pieceIsWhite ? 2 : 7);
  const oneStop = pieceIsWhite ? /[1bnpqr]?/ : /[1BNPQR]?/;
  const distance = pieceIsWhite ? /^1*[bnpqr]?/ : /^1*[BNPQR]?/;
  const oppColor = pieceIsWhite ? 'b' : 'w';

  const squares = Object.freeze(
    {
      b: rays.filter( (r, i) => i % 2 > 0 ),
      k: rays.map( r => r.slice(0, 2) ),
      n: jumpCircleAround(origin),
      p: [
        pushes.slice(0, 2), // push
        orgIsOnInitRank ? pushes.slice(3) : '', // double push
        rays[pieceIsWhite ? 7 : 5].slice(0, 2), // left diagonal
        rays[pieceIsWhite ? 1 : 3].slice(0, 2) // right diagonal
      ],
      q: rays,
      r: rays.filter( (r, i) => i % 2 === 0 )
    }[pieceOnOrg.toLowerCase()]
  );

  const range = Object.freeze(
    ppdSubset(ppd64, squares).map( (s, i, pieces) => {
      if (s.length === 0) {
        return 0;
      }
      if ( pieceOnOrg.match(/[kn]/i) ) {
        return s.match(oneStop)[0].length;
      }
      if ( pieceOnOrg.match(/[bqr]/i) ) {
        return s.match(distance)[0].length;
      }
      switch (i) {
        case 0: // pawn push
          return s == 1 ? 1 : 0;
        case 1: // double push
          return pieces[0] == 1 && s == 1 ? 1 : 0;
        case 2: // left diagonal
        case 3: // right diagonal
          return color(s) === oppColor || squares[i] == epts ? 1 : 0;
      }
    })
  );

  // proper subset of csv w/o array-making, just count chars & commas
  return Object.freeze(JSON.parse(JSON.stringify([
    squares.map( (csv, i) => csv.slice(0, 3 * (range[i] || 1/3) - 1) ),
    pieceOnOrg,
    pieceIsWhite
  ])));
}

/**
 * Legal moves for a single piece
 * @param {string} org origin square of the piece to generate legal moves for
 * @param {Array} ppd64 sequence of 64 single character strings representing either a piece on a square or an empty square, in FEN
 * @param {string} ac active color from FEN, a single char 'w' or 'b'
 * @param {string} ca castling availability from FEN
 * @param {string} epts en passant target square from FEN, in algebraic notation
 * @param {string} constraint a comma-sep list of algebraic notation along which check is given or a piece is pinned
 * @returns target square list, comma-delimited algebraic notation
 */
 function legalMoves(org, ppd64, ac, ca, epts, constraint, isCheck) {
  const [
    targets, pieceOnOrg, pieceIsWhite
  ] = targetsOfAPiece(org, ppd64, epts);

  /* Weed out of bounds results with a filter on positive length before
  any splitting of CSVs, flattening, and/or attack mapping. */

  // non-king pieces
  if (pieceOnOrg.match(/k/i) == null) {
    const allTargets = Object.freeze(
      targets.filter(csv => csv.length > 0).map( csv => csv.split(',') ).flat()
    );
    const interposing = n => constraint.split(',').includes(n);
    const limiter = constraint.length > 0 ? interposing : n => true;

    return allTargets.filter(limiter).join(',')
  }

  /* here: king, where each element of "targets" is only a single square */

  const unattacked = Object.freeze(
    targets.filter(n => n.length > 0).filter(n => {
      return attackMap(ppd64, ac, n).every(s => s.length === 0);
    })
  );
  const activeSides = ac === 'w' ? /K?Q?/ : /k?q?$/;
  const availableSides = ca.match(activeSides)[0];

  if (isCheck || availableSides.length === 0) {
    return unattacked.join(',');
  }

  const ltMove = pieceIsWhite ? 'd1' : 'd8';
  const rtMove = pieceIsWhite ? 'f1' : 'f8';
  const queenside = pieceIsWhite ? 'c1' : 'c8';
  const kingside = pieceIsWhite ? 'g1' : 'g8';

  const mayCastleQside = (
    availableSides.match(/q/i) &&
    unattacked.includes(ltMove) &&
    getPieceOn(ltMove, ppd64) == 1 &&
    attackMap(ppd64, ac, queenside).every(s => s.length === 0) &&
    getPieceOn(queenside, ppd64) == 1
  );

  const mayCastleKside = (
    availableSides.match(/k/i) &&
    unattacked.includes(rtMove) &&
    getPieceOn(rtMove, ppd64) == 1 &&
    attackMap(ppd64, ac, kingside).every(s => s.length === 0) &&
    getPieceOn(kingside, ppd64) == 1
  );

  return unattacked.concat(
    mayCastleQside ? [ queenside ] : []
  ).concat(
    mayCastleKside ? [ kingside ] : []
  ).join(',');
}

/**
 * Legal moves generation
 * @param {string} position chess position in Forsyth-Edwards Notation (FEN) with at least the first 4 of 6 total fields, space-separated
 * @returns list of moves in Pure Coordinate Notation (PCN)
 */
function allMoves(position) {
  const [ ppd, ac, ca, epts ] = position.split(' ');

  const ppd64 = expand(ppd);

  const origins = an64.filter( (n, i) => {
    return color(ppd64[i]) === ac;
  });

  const attacksOnKing = attackMap(ppd64, ac);

  const absPins = Object.freeze(
    attacksOnKing.filter( s => s.length > 0 && s.includes(':') )
  );

  const checks = Object.freeze(
    attacksOnKing.filter(s => s.length > 0 && s.includes(':') === false)
  );

  const noMoves = '';

  if (checks.length > 1) {
    return origins.map(n => {
      const pc = getPieceOn(n, ppd64);
      if ( pc.match(/k/i) ) {
        return (n +
          legalMoves(n, ppd64, ac, ca, epts, '', true).replace(
            /,/g, ',' + n
          )
        );
      }
      return noMoves;
    }).filter(n => n.length > 2).join(',');
  }

  const originsOfPinned = Object.freeze( absPins.map(s => s.split(':')[0]) );

  const absPinRays = Object.freeze( absPins.map(s => s.split(':')[1]) );

  if (checks.length === 1) {
    return origins.map(n => {
      if ( originsOfPinned.includes(n) ) {
        return noMoves;
      }
      return (n +
        legalMoves(n, ppd64, ac, ca, epts, checks[0], true).replace(
          /,/g, ',' + n
        )
      );
    }).filter(n => n.length > 2).join(',');
  }

  // no checks
  return origins.map(n => {
    if ( originsOfPinned.includes(n) ) {
      const idx = originsOfPinned.indexOf(n);
      return (n +
        legalMoves(n, ppd64, ac, ca, epts, absPinRays[idx]).replace(
          /,/g, ',' + n
        )
      );
    }
    return (n +
      legalMoves(n, ppd64, ac, ca, epts, '').replace(
        /,/g, ',' + n
      )
    );
  }).filter(n => n.length > 2).join(',');
}

export default {
  expand,
  color,
	fileSeq,
	rankSeq,
	nextOnDiag,
	diagSeq,
  raysFrom,
	jumpCircleAround,
  rayAttackPatterns,
  ppdSubset,
  trimToRayEvent,
  trimToJumpEvent,
  attackMap,
  targetsOfAPiece,
	legalMoves,
  allMoves
}


function runMoves() {
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

function nFEToUnicode(capturesInFEN) {
  return capturesInFEN.split('').map(s => {
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
 * Params express a move and a chess position as defined by 5 of 6 fields of Forsyth-Edwards Notation (FEN) and a string list of captured pieces in FEN.
 * This function moves a piece on the piece placement data-based array representation of a chessboard. The piece placement data field of FEN is the layout of pieces by rank, pieces are single character first letters of name of type of piece, capitalized for white, lowercase for black, empty spaces marked by numbers, compressing consecutive empty squares into digits greater than 1.
 * @param {string} pcn move made, in Pure Coordinate Notation (PCN).
 * @param {Array} ppd64 sequence of 64 single character strings representing either a piece on a square or an empty square, in FEN
 * @param {string} ac active color, indicates the color of the side that has the move, a single char string 'w' for white or 'b' for black
 * @param {string} ca castling availability, indicates whether each color may castle king/queenside by k and q chars, capital for white, lowercase for black; only indicates availability due to lack of movement/loss of king and rooks from initial position, does not indicate whether king is attacked or if paths are clear; dash indicates no castling availability both black and white
 * @param {string} epts en passant target square, indicates that an en passant capture is available by listing the square to move to for the capture, dash char for no en passant capture available
 * @param {string} hmc halfmoveClock, the count of reversible halfmoves (halfmove is a single turn by white or black) but does include castling which is irreversible; count resets to 0 on pawn move or capture (irreversible)
 * @param {string} capturesInFEN string of piece chars in FEN representing pieces no longer in the PPD due to capture.
 * @returns the next position expressed in FEN (WITHOUT FMN???)
 */
function nextPosition(pcn, position) {
  const org = pcn.slice(0, 2);
  const tsq = pcn.slice(2, 4);
  const pro = pcn.slice(4);

  const board = new Map();

  const pcnOfCastlingRook = { e1g1: 'h1f1',
    e1c1: 'a1d1', e8g8: 'h8f8', e8c8: 'a8d8'
  }[pcn];
  const kingOrRookEvent = pcn.match(/[aeh][18]/)?.[0];
  const eptf = pcn.match(/([a-h])2\1[4]|([a-h])7\2[5]/) || '';

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


/**
 *
 * @param {string} legalMoves comma-sep list of pure coordinate notation (PCN) for each legal move, rank-ascending by origin
 * @returns a comma-sep list of character pairs, each pair corresponds to the item of same index (indexed by order in a comma-separated list) in {@link legalMoves}, and the first character in each pair is the piece on origin square in FEN, and the second character is the piece on the target square in FEN
 */
function getPieceCollisions(legalMoves, ppd64) {
  return legalMoves.split(',').map(n => {
    return getPieceOn(n.slice(0, 2), ppd64) + getPieceOn(n.slice(2, 4), ppd64);
  }).join(',');
};

/**
 * @param {string} pcn a chess move given in pure coordinate notation (PCN)
 * @param {Array} da strings in 'PCN,part-of-origin' format, each for one of all the moves whose origin needs to be at least partially specified in standard algebraic notation
 * @returns per FIDE laws of chess and PGN standard algebraic notation, the rank and/or file of the origin of the piece being moved required to clarify which of multiples of a type of piece is being moved to a legal target common to the multiples
 */
const getDA = (pcn, da) => da.filter(s => s.slice(0, 4) === pcn)[0]?.slice(5);

/**
 *
 * @param {string} ppd piece placement data from FEN
 * @param {Boolean} isWhite whether the user is attempting to obtain white pieces material list
 * @returns all pieces of the same color in FEN
 */
function getMaterialInFEN(ppd, isWhite) {
  return ppd.split('/').map( (v, i, o) => o[7 - i] ).join('').replace(
    isWhite ? /[bknpqr1-8]/g : /[BKNPQR1-8]/g, ''
  );
}

/**
 * Analyzes sets of pieces to see if there is insufficient material to checkmate.
 * @param {Array} movesOrMaterial a list of all legal moves in 'org,piece,targets' format or a list of opposite-active-color material in 'org,piece' format
 * @returns Boolean indicating whether the given side's material is sufficient to win by checkmate
 */
function isInsufficientMaterial(materialInFEN) {
  if (materialInFEN.length > 3) {
    return false;
  }

  return (
    'b,n,bn,nb,nn'.split(',').some(s => {
      return s === materialInFEN.toLowerCase().replace('k', '');
    })
  );
}

/*
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
  in a pattern like b: [ {c1: ['b2']}, {f1: ['g2']} ]
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

   * * The status of white and black sides for the position based on active color and legal moves. These status could be useful as chess clock captions.
 * * If the position is game termination, the game over reason is given.

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
*/

/**
 * Translates pure coordinate notation (PCN) to standard algebraic notation (SAN) using legal moves listing, per FIDE Laws.
 * @param {string} pcn a chess move given in PCN
 * @param {Array} allMoves a list of all legal moves in 'org,piece,targets' format
 * @param {Array} ppd64 sequence of 64 single character strings representing either a piece on a square or an empty square, in FEN
 * @param {Array} disambiguation strings in 'PCN,part-of-origin' format, each for one of all the moves whose origin needs to be at least partially specified in standard algebraic notation
 * @returns SAN for given chess move
 */
function toSAN(pcn, allMoves, ppd64, disambiguation) {
  const castlingData = pcn.match(/e([18])([cg])\1/);
  const isCastling = castlingData != null;

  if (isCastling) {
    return "O-O" + (castlingData[2] === 'c' ? '-O': '');
  }

  const org = pcn.slice(0, 2);
  const tsq = pcn.slice(2, 4);
  const pro = pcn.slice(4);
  const movingPiece = getPcOnOrg(org, allMoves).toUpperCase();
  const targets = Object.freeze( getTSq(org, allMoves).split(',') );
  const tsqIdx = targets.indexOf(tsq);
  const capturedPiece = targets.map( n => getPieceOn(n, ppd64) )[tsqIdx];

  if (movingPiece === 'P') {
    return (
      (capturedPiece != 1 || org[0] !== tsq[0] ? org[0] + 'x' : '') +
      tsq + (pro ? '=' + pro : '')
    );
  }

  return (
    movingPiece + (getDA(pcn, disambiguation) || '') +
    (capturedPiece != 1 ? 'x' : '') + tsq
  );
}
