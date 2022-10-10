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
 * An arrow function to be used as the callback of Array.prototype.map that will reverse the elements in a new array, avoiding Array.prototype.reverse's array mutation
 * @param {*} v dummy value
 * @param {Number} k dummy index
 * @param {Array} o dummy object, represents the array on which Array.prototype.map is called, this function being the callback of map
 * @returns element as far from the end as the element indicated by dummy index is from the start
 */
const reverse = (v, k, o) => o[o.length - 1 - k];

/**
 * Produces an array form of piece placement data (PPD) from chess position in Forsyth-Edwards Notation (FEN), where each char in PPD, digits converted into '1' chars, is an array element. Features option to order rank-ascending, to best represent a board of moveable pieces, or rank-descending, for printing a text representation of a chessboard to console.
 * @param {string} ppd first space-delimited substring from FEN chess position
 * @param {boolean} isRankDescending choose order of PPD chars in array
 * @returns FEN piece placement data without rank delimiters and with digits greater than 1 replaced by a string of 1s of length equal to digit, for a sequence of 64 single character strings representing either a piece on a square or an empty square
 */
const expand = (ppd, isRankDescending) => {
  return ppd.replace( /\d/g, d => '1'.repeat(d) ).split('/').map(
    isRankDescending ? rank => rank : reverse
  ).join('');
};

/**
 * Given a square, get the FEN of the piece on it.
 * @param {string} square algebraic notation of the square that you want to know the piece on
 * @param {string} ppd64 sequence of 64 characters each representing either a piece on a square or an empty square, in FEN
 * @returns the piece in FEN on the given square but if the square is not valid algebraic notation, empty string is returned
 */
const getPieceOn = (square, ppd64) => ppd64[an64.indexOf(square)] || '';

/**
 *
 * @param {string} ppd64 sequence of 64 characters each representing either a piece on a square or an empty square, in FEN
 * @param {string} ac active color from FEN, a single char 'w' or 'b'
 * @returns algebraic notation of the square that the king of active color is on
 */
const getActiveKingSquare = (ppd64, ac) => {
  return an64[ppd64.indexOf(ac === 'w' ? 'K' : 'k')];
};

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
    return (
      n[0] === startSquare[0] &&
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
    return (
      n[1] === startSquare[1] &&
      (isRt ? n > startSquare : n < startSquare)
    );
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

/**
 * Use the Forsyth-Edwards Notation character for a piece of a type and color
 * as a key to get the Unicode symbol for that piece. White and black kings are
 * not included because this is meant to be used as a way to make a symbolic
 * list of all captured pieces, and kings can't be captured.
 */
const charTable = Object.freeze({
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
});

/**
 *
 * @param {string} n Forsyth-Edwards Notation (FEN) for pieces, can be a single notation character or a consecutive/non-delimited string of FEN piece characters
 * @returns single or non-delimited string of Unicode chess piece symbols
 */
const nFEToUnicode = n => n.split('').map(s => charTable[s]).join('');

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
  ].map( s => an64[diffs.indexOf(s)] || '') );
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
        rankfile: /^1*[BNPQR]?1*[qr]/,
        diagAbove: /^p|^1*[BNPQR]?1*[bq]/,
        diagBelow: /^1*[BNPQR]?1*[bq]/
      });
    }
    return Object.freeze({
      rankfile: /^k|^K?1*[qr]/,
      diagAbove: /^[kp]|^K?1*[bq]/,
      diagBelow: /^k|^K?1*[bq]/
    });
  }

  if (activeColor === 'b') {
    if (isForKingsOriginSquare) {
      return Object.freeze({
        rankfile: /^1*[bnpqr]?1*[QR]/,
        diagAbove: /^1*[bnpqr]?1*[BQ]/,
        diagBelow: /^P|^1*[bnpqr]?1*[BQ]/
      });
    }
    return Object.freeze({
      rankfile: /^K|^k?1*[QR]/,
      diagAbove: /^K|^k?1*[BQ]/,
      diagBelow: /^[KP]|^k?1*[BQ]/
    });
  }
}

/**
 * Subsets of piece placement data, collecting either all pieces along each chessboard ray of squares out from an origin square or all pieces that are a knight's jump away from an origin square.
 * @param {string} ppd64 sequence of 64 characters each representing either a piece on a square or an empty square, in FEN
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
          return (s.match(rayAttackPatterns.diagAbove) || [ '' ])[0];
        case 3:
        case 5:
          return (s.match(rayAttackPatterns.diagBelow) || [ '' ])[0];
        default:
          return (s.match(rayAttackPatterns.rankfile) || [ '' ])[0];
      }
    })
  );
}

/**
 * List rays of squares and single squares from which an origin is attacked.
 * @param {string} ppd64 sequence of 64 characters each representing either a piece on a square or an empty square, in FEN
 * @param {string} ac active color from FEN, a single char 'w' or 'b'
 * @param {string} square the square that is potentially attacked, in algebraic notation, assumed to be the king's square if not provided
 * @returns an array of CSV strings of algebraic notation sequences: even-indexed strings are rays of sliding check on king, absolute pin of a piece to king, or attack on a non-king-occupied square; odd-indexed strings are single squares of jump attack; index 0 denotes the north direction on chessboard and following indices go clockwise around the compass points
 */
function attackMap(ppd64, ac, square) {
  const org = square ?? getActiveKingSquare(ppd64, ac);
  const rays = raysFrom(org);
  const jumps = jumpCircleAround(org);
  const rayAttacks = trimToRayEvent(
    ppdSubset(ppd64, rays),
    rayAttackPatterns(ac, square == null)
  );
  const jumpAttacks = Object.freeze(ppdSubset(ppd64, jumps).map(s => {
    return s === (ac === 'w' ? 'n' : 'N') ? s : '';
  }));

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
 * @param {string} ppd64 sequence of 64 characters each representing either a piece on a square or an empty square, in FEN
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
 * @param {string} ppd64 sequence of 64 characters each representing either a piece on a square or an empty square, in FEN
 * @param {string} ac active color from FEN, a single char 'w' or 'b'
 * @param {string} ca castling availability from FEN
 * @param {string} epts en passant target square from FEN, in algebraic notation
 * @param {string} constraint a comma-sep list of algebraic notation along which check is given or a piece is pinned
 * @returns target square list, comma-delimited algebraic notation
 */
 function legalTargetsOfAPiece(org, ppd64, ac, ca, epts, constraint, isCheck) {
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
 * @param {Array} attacksOnKing CSV strings of algebraic notation sequences: even-indexed strings are rays of sliding check on king, absolute pin of a piece to king, or attack on a non-king-occupied square; odd-indexed strings are single squares of jump attack; index 0 denotes the north direction on chessboard and following indices go clockwise around the compass points.
 * @returns list of moves in Pure Coordinate Notation (PCN)
 */
function getLegalMoves(position, attacksOnKing) {
  const [ ppd, ac, ca, epts ] = position.split(' ');

  const ppd64 = expand(ppd);

  const origins = an64.filter( (n, i) => {
    return color(ppd64[i]) === ac;
  });

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
          legalTargetsOfAPiece(n, ppd64, ac, ca, epts, '', true).replace(
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
        legalTargetsOfAPiece(n, ppd64, ac, ca, epts, checks[0], true).replace(
          /,/g, ',' + n
        )
      );
    }).filter(n => n.length > 2).join(',');
  }

  // no checks
  return origins.map( n => {
    if ( originsOfPinned.includes(n) ) {
      return ( n +
        legalTargetsOfAPiece( n, ppd64, ac, ca, epts,
          absPinRays[originsOfPinned.indexOf(n)]
        ).replace( /,/g, ',' + n )
      );
    }
    return ( n +
      legalTargetsOfAPiece(n, ppd64, ac, ca, epts, '').replace( /,/g, ',' + n )
    );
  } ).filter( n => n.length > 2 ).join(',');
}

/**
 * Params express a move and a chess position as defined by 5 of 6 fields of Forsyth-Edwards Notation (FEN) and a string list of captured pieces in FEN.
 * This function moves a piece on the piece placement data-based array representation of a chessboard. The piece placement data field of FEN is the layout of pieces by rank, pieces are single character first letters of name of type of piece, capitalized for white, lowercase for black, empty spaces marked by numbers, compressing consecutive empty squares into digits greater than 1.
 * @param {string} pcn move made, in Pure Coordinate Notation (PCN).
 * @param {string} position chess position in Forsyth-Edwards Notation (FEN) with at least the first 4 of 6 total fields, space-separated
 * @returns the next position expressed in the first 5 of 6 fields of FEN, comma separated with captured piece in FEN
 */
 function nextPosition(pcn, position) {
  const org = pcn.slice(0, 2);
  const tsq = pcn.slice(2, 4);
  const pro = pcn.slice(4);
  const [ ppd, ac, ca, epts, hmc ] = position.split(' ');
  const proInFEN = ac === 'w' ? pro.toUpperCase() : pro;
  const ppd64 = expand(ppd);
  const pcnOfCastlingRook = { e1g1: 'h1f1',
    e1c1: 'a1d1', e8g8: 'h8f8', e8c8: 'a8d8'
  }[pcn];
  const pawnMoved = ppd64[an64.indexOf(org)].match(/p/i);
  const enPassantTaken = pawnMoved && tsq === epts;
  const sqOfEPCapturedPawn = ( epts[0] +
    (ac === 'w' ? epts[1] - 1 : parseInt(epts[1]) + 1)
  );
  const nFEOnTargetSq = (enPassantTaken ?
    ppd64[an64.indexOf(sqOfEPCapturedPawn)] :
    ppd64[an64.indexOf(tsq)]
  );

  const next64 = Object.freeze(ppd64.split('').map( (n, i, p) => {
    if ( an64[i] === org ||
      an64[i] === pcnOfCastlingRook?.slice(0, 2) ||
      enPassantTaken && an64[i] === sqOfEPCapturedPawn
    ) {
      return '1';
    }
    if ( an64[i] === tsq ) {
      return pro.length > 0 ? proInFEN : p[an64.indexOf(org)];
    }
    if ( an64[i] === pcnOfCastlingRook?.slice(2, 4) ) {
      return p[an64.indexOf( pcnOfCastlingRook.slice(0, 2) )];
    }
    return n;
  }));

  const castlingSides = Object.freeze(new Map([
    [ 'h1', 'K' ], [ 'a1', 'Q' ],
    [ 'h8', 'k' ], [ 'a8', 'q' ],
    [ 'e1', 'KQ' ], [ 'e8', 'kq' ]
  ]));

  const kingOrRookEvent = pcn.match(/[aeh][18]/)?.[0];

  const epMatch = pcn.match(/([a-h])2\1[4]|([a-h])7\2[5]/) || '';

  return [
    next64.map( (n, i) => {
      if (i > 0 && i % 8 === 0) {
        return '/' + n;
      }
      return n;
    }).join('').split('/').map(reverse).join('/').replace(
      /1{2,8}/g, match => match.length
    ),

    ac === 'w' ? 'b' : 'w',

    ca.replace(castlingSides.get(kingOrRookEvent), '') || "-",

    ( epMatch.length ?
      (epMatch[2] == null ? epMatch[1] + 3 : epMatch[2] + 6) :
      "-"
    ),

    (pawnMoved || nFEOnTargetSq != 1 ? 0 : parseInt(hmc) + 1)
  ].join(' ');
}

/**
 *
 * @param {string} ppd piece placement data from FEN
 * @param {Boolean} isWhite whether the user is attempting to obtain white pieces material list
 * @returns all pieces of the same color in FEN
 */
function getMaterialInFEN(ppd, isWhite) {
  return ppd.split('/').map(reverse).join('').replace(
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

/**
 * For conversion from Pure Coordinate Notation to Standard Algebraic Notation.
 * @param {string} legalMoves list of all legal moves in Pure Coordinate Notation (PCN)
 * @param {string} ppd64 sequence of 64 characters each representing either a piece on a square or an empty square, in FEN
 * @returns list of legal moves in PCN that need disambiguation in SAN, and each PCN move listed has the disambiguation character attached to the end
 */
function disambiguationTable(legalMoves, ppd64) {
  const byPieceType = s => {
    return n => getPieceOn(n.slice(0, 2), ppd64).match( new RegExp(s, 'i') );
  };

  const movesOfTwinnedPieces = Object.freeze([
    Object.freeze( legalMoves.split(',').filter( byPieceType('b') ) ),
    Object.freeze( legalMoves.split(',').filter( byPieceType('n') ) ),
    Object.freeze( legalMoves.split(',').filter( byPieceType('q') ) ),
    Object.freeze( legalMoves.split(',').filter( byPieceType('r') ) )
  ]);

  return movesOfTwinnedPieces.map(lm => {
    return lm.map( (pcn, i, moves) => {
      const diffOrgSameTrg = moves.filter(n => {
        return ( n.slice(0, 2) !== pcn.slice(0, 2) &&
          n.slice(2) === pcn.slice(2)
        );
      }).join('');
      const twinMove = diffOrgSameTrg.slice(0, 4);
      const tripletMove = diffOrgSameTrg.slice(4);
      if (tripletMove && pcn[0] !== twinMove[0] && pcn[0] !== tripletMove[0]) {
        return pcn + pcn[0];
      }
      if (tripletMove && pcn[1] !== twinMove[1] && pcn[1] !== tripletMove[1]) {
        return pcn + pcn[1];
      }
      if (tripletMove) {
        return pcn + pcn.slice(0, 2);
      }
      if (twinMove) {
        return pcn + (pcn[0] !== twinMove[0] ? pcn[0] : pcn[1]);
      }
      return pcn;
    }).filter(n => n.length > 4);
  }).flat().join(',');
}

/**
 * Translates pure coordinate notation (PCN) to standard algebraic notation (SAN) using legal moves listing, per FIDE Laws.
 * @param {string} pcn a chess move given in PCN
 * @param {Array} legalMoves a list of all legal moves in PCN
 * @param {string} ppd64 sequence of 64 characters each representing either a piece on a square or an empty square, in FEN
 * @param {string} disambiguationTable comma-separated strings of 5-6 chars, first 4 chars is always PCN, 5th and/or 6th the disambiguation portion of origin square and there is a string for each move whose origin needs to be at least partially specified in standard algebraic notation
 * @param {Array} nextAttacks output of {@link attackMap} called with the 64-length piece placement and active color resulting from {@link nextPosition} with inputs the {@link pcn} parameter here and the position corresponding to the {@link ppd64} parameter here.
 * @param {string} nextAllMoves output of {@link legalMoves} called with the output of {@link nextPosition}, "next" being after the position indicated by the {@link pcn} and {@link ppd64} parameters here
 * @returns SAN for given chess move
 */
 function toSAN(pcn, ppd64, disambiguationTable, nextAttacks, nextAllMoves) {
  const castlingData = pcn.match(/e([18])([cg])\1/);
  const isCastling = castlingData != null;

  if (isCastling) {
    return "O-O" + (castlingData[2] === 'c' ? '-O': '');
  }

  const org = pcn.slice(0, 2);
  const tsq = pcn.slice(2, 4);
  const pro = pcn.slice(4);
  const pieceInFENUpper = getPieceOn(org, ppd64).toUpperCase();
  const pieceInSAN = pieceInFENUpper === 'P' ? '' : pieceInFENUpper;

  const captureOccurred = (
    getPieceOn(tsq, ppd64) != 1 ||
    pieceInSAN.length === 0 && org[0] !== tsq[0]
  );

  const disambiguation = disambiguationTable.split(',').filter(n => {
    return n.slice(0, 4) === pcn;
  })[0]?.slice(4) ?? '';

  const isCheck = nextAttacks.some( s => s.length && !s.includes(':') );

  const isMate = isCheck && nextAllMoves.length === 0;

  if (pieceInSAN.length === 0) { // pawn
    return (
      (captureOccurred ? org[0] + 'x' : '') + tsq +
      (pro ? '=' + pro : '') +
      (isCheck ? (isMate ? "#" : "+") : '')
    );
  }

  return (
    pieceInSAN + disambiguation +
    (captureOccurred ? 'x' : '') + tsq +
    (isCheck ? (isMate ? "#" : "+") : '')
  );
}

/**
 *
 * @param {string} positions comma-separated sequence of chess positions
 * @returns true or false if this sequence of chess positions repeats a position twice for a total of 3 occurrences
 */
function is3foldRep(positions) {
  return positions.split(',').map(p => {
    return p.split(' ').slice(0, 4).join(' '); // remove hmc
  }).filter( (p, i, ps) => {
    return ps.some( (s, j) => {
      return s === p && j !== i; // list only dupl. positions
    });
  }).map( (m, i, ds) => {
    return ds.filter(d => d === m).length; // map to occurrence count
  }).some(x => x === 3);
  // positions are incremented, so 3 will be found before exceeding 3
}

/**
 * Creates an object which prints a minimal Portable Game Notation export string
 * @constructor
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
  this.result = '*';
}

/**
 *
 * @param {Object} pgnSTR Object whose properties comprise the Seven Tag Roster of the Portable Game Notation standard
 * @param {string} [result] game termination marker, defaults to the in-progress marker
 * @param {string} [movetext] The Portable Game Notation sequence of moves in Standard Algebraic Notation
 * @returns Portable Game Notation text for export
 */
function printPGN(pgnSTR, result, movetext) {
  const tagNames = Object.keys(pgnSTR).map(s => {
    return s[0].toUpperCase() + s.slice(1);
  }).join(',');

  const tagValues = Object.freeze(
    Object.values(pgnSTR).map( (s, i, values) => {
      if (i === values.length - 1) {
        return '"' + (result || s) + '"';
      }
      return '"' + s + '"';
    })
  );

  return tagNames.split(',').map( (name, i, roster) => {
    return (
      [ (i === 0 ? '[' : '') + name,
        tagValues[i] + (i === roster.length - 1 ? ']' : '')
      ].join(' ')
    );
  }).join(']\n[') + '\n\n' + (movetext == null ? '' : movetext + '\n');
}

/**
 *
 * @param {string} sequenceOfMoves comma-separated list of chess moves in Pure Coordinate Notation (PCN), listed in order played
 * @param {string} position an expression of chess position with the first five fields of Forsyth-Edwards Notation (FEN), corresponds to the board arrangement on which one of the moves in sequence was played
 * @param {number} indexOfMove zero-based index indicating which in the sequence of moves was played on {@link position}
 * @returns comma-separated sequence of chess positions (each expressed by the 1st 5 fields of FEN) from the position that the first move in sequence was played on to the position resulting from the play of the final move in sequence
 */
function getSequenceOfPositions(sequenceOfMoves, position, indexOfMove) {
  if (indexOfMove === sequenceOfMoves.split(',').length) {
    return position;
  }

  const move = (indexOfMove == null ?
    sequenceOfMoves.split(',')[0] :
    sequenceOfMoves.split(',')[indexOfMove]
  );

  return [
    position,
    getSequenceOfPositions(
      sequenceOfMoves,
      nextPosition(move, position),
      (indexOfMove ?? 0) + 1
    )
  ].join(',');
}

/**
 *
 * @param {string} before chess material for one side, before a move is made by the other side, material expressed in FEN chars no-delim., and gleaned from FEN in rank-ascending, file left-to-right order, per {@link getMaterialInFEN}
 * @param {string} after the {@link before} chess material for one side potentially changed by the move made by the other side due to capture, expressed in FEN chars no-delim., still in rank-ascending order
 * @returns either a single FEN char not present in the {@link after}-material that was present in the {@link before}-material, indicating the piece captured by the other side, or an empty string indicating that no capture occurred
 */
function getMissingMaterial(before, after) {
  return before[
    before.split('').map( (charInBefore, idxOfCharInBefore) => {
      return charInBefore === after[idxOfCharInBefore];
    }).indexOf(false)
  ] || '';
}

/**
 *
 * @param {string} positionSeq comma-separated sequence of chess positions each expressed by the 1st 5 fields of Forsyth-Edwards Notation (FEN)
 * @returns non-delimited string of FEN chars representing the sequence of captures
 */
function getSequenceOfCaptures(positionSeq) {
  if (positionSeq.split(',').length < 2) {
    return '';
  }

  const materialSeq = positionSeq.split(',').map( (p, i) => {
    if (i === 0) {
      return getMaterialInFEN(p.split(' ')[0]);
    }
    return [
      getMaterialInFEN( p.split(' ')[0],
        p.split(' ')[1] === 'w'
      ),
      getMaterialInFEN( p.split(' ')[0],
        p.split(' ')[1] === 'b'
      )
    ].join(',');
  }).join(',').split(',').slice(0, -1).join(',');
  /* Remove the 2nd material listed for last position because it is always
   unpaired due to no next position's material to compare it with. */

  return materialSeq.split(',').reduce(
    (capturesAndOrMaterial, material, idxOfMaterial) => {
      if (idxOfMaterial === 1) {
        return getMissingMaterial(capturesAndOrMaterial, material);
      }
      return ( idxOfMaterial % 2 === 0 ?
        [ capturesAndOrMaterial, material ].join(',') :
        ( capturesAndOrMaterial.split(',')[0] +
          getMissingMaterial( capturesAndOrMaterial.split(',')[1], material )
        )
      );
    }
  );
}

/**
 *
 * @param {string} sequence comma-separated list of chess moves in Pure Coordinate Notation (PCN), listed in order played
 * @param {Object} pgnSTR Object whose properties comprise the Seven Tag Roster of the Portable Game Notation (PGN) standard
 * @returns JSON data expressing the position and legal moves resulting from the last move in sequence, text indicators to distinguish which of white or black has the move and the other to have just made a move, scoresheet information such as the PGN movetext, symbols of captured pieces, and a text description of results if game is over; lastly a PGN plain text export of the game if the game is over
 */
function getGameStatus(sequence, pgnSTR) {
  const initPosition = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0"

  if (sequence.length === 0) {
    const initLegalMoves = getLegalMoves(
      initPosition,
      attackMap(
        expand(initPosition.split(' ')[0]),
        initPosition.split(' ')[1]
      )
    );

    return JSON.stringify({
      position: initPosition,
      legalMoves: initLegalMoves,
      white: "Has move",
      black: "",
      openingName: '',
      movetext: '',
      capturedList: '',
      gameover: '',
      pgn: ''
    });
  }

  const endSignal = sequence.match(/[RT]$|D,D$/)?.[0];

  const pcnHalfmoves = sequence.replace(/,[RT]|D|,D/g, '');

  const positions = getSequenceOfPositions(pcnHalfmoves, initPosition);

  const capturedList = nFEToUnicode( getSequenceOfCaptures(positions) );

  const attacksPerPosition = Object.freeze(
    positions.split(',').map(p => {
      return Object.freeze(
        attackMap(
          expand(p.split(' ')[0]),
          p.split(' ')[1]
        )
      );
    })
  );

  const legalMovesPerPosition = Object.freeze(
    positions.split(',').map( (p, i) => {
      return getLegalMoves(p, attacksPerPosition[i]);
    })
  );

  const disambiguationPerPosition = Object.freeze(
    legalMovesPerPosition.map( (lm, i) => {
      return disambiguationTable(
        lm,
        expand(positions.split(',')[i].split(' ')[0])
      );
    })
  );

  const halfmoves = pcnHalfmoves.split(',').map( (pcn, i) => {
    return toSAN(
      pcn,
      expand(positions.split(',')[i].split(' ')[0]),
      disambiguationPerPosition[i],
      attacksPerPosition[i + 1],
      legalMovesPerPosition[i + 1]
    );
  }).join(',');

  const fullmoveNumberIndicatorTokensMerged = Array.from(
    {length: Math.ceil(pcnHalfmoves.split(',').length / 2)},
    (v, k) => (k + 1) + '.'
  ).join(',');

  const numberedMoves = fullmoveNumberIndicatorTokensMerged.split(',').map(
    (fmn, i) => {
      const whitePly = halfmoves.split(',')[2 * i];
      const blackPly = halfmoves.split(',')[2 * i + 1];
      return [ fmn, whitePly ].concat(
        blackPly == null ? [] : [ blackPly ]
      ).join(' ');
    }
  ).join(' ');

  const isCheckOrMate = numberedMoves.match(/[#\+]$/) != null;
  const sanMark = isCheckOrMate ? numberedMoves.at(-1) : '';

  const hasMoveMsg = (
    sanMark.length > 0 ?
    { "+": "check", "#": "checkmate" }[sanMark] :
    "Has move"
  );

  const resultingPosition = positions.split(',').at(-1);

  const resultingPPD = resultingPosition.split(' ')[0];

  const resultingACIsWhite = resultingPosition.split(' ')[1] === 'w';

  const white = resultingACIsWhite ? hasMoveMsg : "Made move";

  const black = white === "Made move" ? hasMoveMsg : "Made move";

  const oppositeActiveColorName = resultingACIsWhite ? "black" : "white";

  const oppositeActiveColorWins = gameOverBy => {
    return [
      gameOverBy + ':',
      oppositeActiveColorName,
      "wins"
    ].join(' ');
  };

  const messages = Object.freeze([
    oppositeActiveColorWins("Resignation"),
    oppositeActiveColorWins("Flag fall"),
    "Draw: " + oppositeActiveColorName + " has insuff. material",
    oppositeActiveColorWins("Mate"),
    "Draw: stalemate",
    "Draw: dead position",
    "Draw by agreement",
    "Draw: three-fold repetition",
    "Draw: 50-move rule"
  ]);

  const oppositeActiveColorCannotCheckmate = isInsufficientMaterial(
    getMaterialInFEN(resultingPPD, !resultingACIsWhite)
  );

  const activeColorCannotCheckMate = isInsufficientMaterial(
    getMaterialInFEN(resultingPPD, resultingACIsWhite)
  );

  const resultingLegalMoves = legalMovesPerPosition.at(-1);

  const condition = [
    endSignal === 'R',
    endSignal === 'T' && oppositeActiveColorCannotCheckmate === false,
    endSignal === 'T' && oppositeActiveColorCannotCheckmate,
    sanMark === "#",
    sanMark.length === 0 && resultingLegalMoves.length === 0,
    activeColorCannotCheckMate && oppositeActiveColorCannotCheckmate,
    endSignal === 'D,D',
    is3foldRep(positions),
    resultingPosition.split(' ')[4] === 50
  ].indexOf(true);

  const gameover = messages[condition] || '';

  const markers = "1-0,0-1,1/2-1/2,*";

  const selection = [
    gameover.includes("white wins"),
    gameover.includes("black wins"),
    gameover.includes("Draw"),
    gameover.length === 0
  ].indexOf(true);

  const gameTerminationMarker = markers.split(',')[selection];

  const movetext = [ numberedMoves, gameTerminationMarker ].join(' ');

  const pgn = (
    gameover.length > 0 ?
    printPGN(pgnSTR, gameTerminationMarker, movetext) : ''
  );

  return JSON.stringify({
    position: resultingPosition,
    legalMoves: resultingLegalMoves,
    white,
    black,
    openingName: '',
    movetext,
    capturedList,
    gameover,
    pgn
  });
}

/** CHESS ENGINE, for now, random moves in Pure Coordinate Notation (PCN)
 * @param {string} legalMoves comma-separated list of all moves that may be made in PCN
 * @returns a randomly chosen move from a list of PCN
*/
function cpuPlay(legalMoves) {
  return legalMoves.split(',')[
    Math.floor( legalMoves.split(',').length * Math.random() )
  ];
}

const ui = { PGNSevenTagRoster, getGameStatus, expand, cpuPlay };

const console = {
  PGNSevenTagRoster,
  getGameStatus,
  expand,
  getPieceOn,
  cpuPlay
};

const units = {
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
  attackMap,
  targetsOfAPiece,
	legalTargetsOfAPiece,
  getLegalMoves,
  nextPosition,
  getMaterialInFEN,
  isInsufficientMaterial,
  disambiguationTable,
  toSAN,
  is3foldRep,
  PGNSevenTagRoster,
  getSequenceOfPositions,
  getSequenceOfCaptures,
  getGameStatus
}

const engine = { ui, console, units }

export default engine;
