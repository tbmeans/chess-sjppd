export default class ChessPosition {
  AN = Array.from( {length: 64}, (v, i) => {
    return "abcdefgh"[i % 8] + ( 8 - parseInt(i / 8) );
  });

  REGX = {
    check: {
      w: [
        /K1*(?<attacker>[qr])/,
        /Kp|K1*(?<attacker>[bq])/,
        /K1*(?<attacker>[bq])/
      ],
      b: [
        /k1*(?<attacker>[QR])/,
        /k1*(?<attacker>[BQ])/,
        /kP|k1*(?<attacker>[BQ])/
      ]
    },
    absolutePin: {
      w: [
        /K1*(?<pinned>[BNPQR])1*(?<attacker>[bq])/,
        /K1*(?<pinned>[BNPQR])1*(?<attacker>[qr])/
      ],
      b: [
        /k1*(?<pinned>[bnpqr])1*(?<attacker>[BQ])/,
        /k1*(?<pinned>[bnpqr])1*(?<attacker>[QR])/
      ]
    }
  };

  constructor(str1, str2) {
    let inFEN;

    if (
      typeof(str1) === "string" && str1.length > 0 &&
      str1.split(' ').length >= 4
    ) {
      inFEN = str1.split(' ').slice(0, 4).join(' ');
      this.inFEN = inFEN;
    } else {
      this.inFEN = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq -";
    }

    if (typeof(str2) === "string") {
      this.xppd = str2;
    } else {
      this.xppd = '';
    }
  }

  get fieldsOfFEN() {
    return this.inFEN.split(' ');
  }

  get piecePlacementData() {
    return this.inFEN.split(' ')[0];
  }

  get ppdLength64NoSlashChars() {
    return this.piecePlacementData.replace(
      /[2-8]/g,
      match => '1'.repeat( parseInt(match) )
    ).replace(/\//g, '');
  }

  get ppd() {
    return this.ppdLength64NoSlashChars;
  }

  toAN(x) { // from ppd index
    if ( x == null || isNaN(x) ) {
      return '';
    }

    let ppdIdx;

    if (x > -1 && x < 64) {
      ppdIdx = parseInt(x);
    } else {
      return '';
    }

    return "abcdefgh"[ppdIdx % 8] + ( 8 - parseInt(ppdIdx / 8) );
  }

  toPpdIdx(x, y) { // from coordinates or algebraic notation
    if (x == undefined && y == undefined) {
      return 0;
    }

    if ( [x, y].some(x => typeof(x) === 'object') ) {
      console.log("Use spread syntax if you want to enter an array.");
      return 0;
    }

    const isFile = s => {
      return ( typeof(s) === 'string' && s.length === 1 &&
        "abcdefgh".includes(s)
      );
    };

    const isRank = x => {
      return !isNaN(x) && parseInt(x) === Number(x) && (x > 0 && x < 9);
    };

    const isChessCartesian = x => isRank(x + 1);

    const isPpdIdx = x => {
      return !isNaN(x) && parseInt(x) === Number(x) && (x > -1 && x < 64);
    };

    if ( [x, y].every(x => isChessCartesian(x)) ) {
      return x - 8 * y + 56;
    }

    if ( isPpdIdx(x) || isPpdIdx(y) ) {
      return isPpdIdx(x) ? x : y;
    }

    const isAN = s => {
      return (typeof(s) === 'string' && s.length === 2 &&
        isFile(s[0]) && isRank(s[1])
      );
    };

    const ppdIdxFromAN = s => "abcdefgh".indexOf(s[0]) - 8 * s[1] + 64;

    if (x != undefined && isAN(x) ) {
      return ppdIdxFromAN(x);
    }

    if ( x == undefined && isAN(y) ) {
      return ppdIdxFromAN(y);
    }

    const listIsAN = (x, y) => isFile(x) && isRank(y);

    if ( listIsAN(x, y) ) {
      return "abcdefgh".indexOf(x) - 8 * y + 64;
    }

    return 0;
  }

  toChessCartesian(x) { // from ppd index or algebraic notation
    if (x == null) {
      return [ 0, 0 ];
    }

    if (typeof(x) === 'object') {
      return x;
    }

    let coordinates;

    if (x > -1 && x < 64) {
      coordinates = this.toAN(x);
      coordinates = [
        "abcdefgh".indexOf(coordinates[0]),
        coordinates[1] - 1
      ];
    }

    if (coordinates == null) {
      if (typeof(x) === 'string' && x.length > 1 &&
        "abcdefgh".includes(x[0]) && "12345678".includes(x[1])
      ) {
        coordinates = [ "abcdefgh".indexOf(x[0]), x[1] - 1 ];
      } else {
        return [0, 0];
      }
    }

    return coordinates;
  }

  get activeColor() {
    return this.inFEN.split(' ')[1];
  }

  get ac() {
    return this.activeColor;
  }

  get castlingAvailability() {
    return this.inFEN.split(' ')[2];
  }

  get ca() {
    return this.castlingAvailability;
  }

  get enPassantTargetSquare() {
    return this.inFEN.split(' ')[3];
  }

  get epts() {
    return this.enPassantTargetSquare;
  }

  // marks all the way to board boundary
  slideAndJumpPlacementData(ppdIdxOfOrg) {
    const [ x0, y0 ] = this.toChessCartesian(ppdIdxOfOrg);
    let sjpd = '';

    for (let x, y, i = 0; i < 64; i++) {
      [ x, y ] = this.toChessCartesian(i);
      if (x === x0 && y === y0) {
        sjpd += 'o'; // origin
      } else if (x === x0) {
        sjpd += 'f'; // file
      } else if (y === y0) {
        sjpd += 'l'; // rank, "l" as in "level" since "r" is for black rook
      } else if (x - x0 === y - y0) {
        sjpd += 'd'; // diagonal
      } else if (x - x0 === y0 - y) {
        sjpd += 'a'; // anti-diagonal
      } else if (
        ( Math.abs(x - x0) == 2 && Math.abs(y - y0) == 1 ) ||
        ( Math.abs(y - y0) == 2 && Math.abs(x - x0) == 1 )
      ) {
        sjpd += 'x' // nearest not on ray
      } else {
        sjpd += '.'; // neither slide nor jump
      }
    }

    return sjpd;
  }

  toPieceColor(nFE) {
    if (nFE == 1) {
      return '';
    }

    return nFE.toUpperCase() === nFE ? 'w' : 'b';
  }

  slideJumpAndPiecePlacementData(ppd, ppdIdxOfOrg, maxPcsMarkedPerRay) {
    const sjpd = this.slideAndJumpPlacementData(ppdIdxOfOrg);

    if (ppd[ppdIdxOfOrg] == 1) {
      return Array.from(sjpd, (s, i) => s + ppd[i]);
    }

    const color = this.toPieceColor;
    const orgPcColor = color(ppd[ppdIdxOfOrg]);
    const rayMarks = [ 'd', 'f', 'a', 'l' ];
    const leftCount = { d: 0, f: 0, a: 0, l: 0 };
    const rightCount = { d: 0, f: 0, a: 0, l: 0 };
    let sjppd = Array(64);
    let l = ppdIdxOfOrg - 1;
    let r = ppdIdxOfOrg + 1;
    let leftMark, rightMark;

    sjppd[ppdIdxOfOrg] = sjpd[ppdIdxOfOrg] + ppd[ppdIdxOfOrg];

    while (l > -1 || r < 64) {
      if (l > -1) {
        leftMark = sjpd[l];
      }

      if (r < 64) {
        rightMark = sjpd[r];
      }

      if (l > -1 && rayMarks.includes(leftMark)) {
        if (ppd[l] != 1) {
          leftCount[leftMark]++;
        }

        if (leftCount[leftMark] > maxPcsMarkedPerRay) {
          leftMark = '.';
        } else if (ppd[l] != 1 && color(ppd[l]) === orgPcColor) {
          leftMark = leftMark.toUpperCase();
          // uppercase indic. same color collision
        }
      }

      if (r < 64 && rayMarks.includes(rightMark)) {
        if (ppd[r] != 1) {
          rightCount[rightMark]++;
        }

        if (rightCount[rightMark] > maxPcsMarkedPerRay) {
          rightMark = '.';
        } else if (ppd[r] != 1 && color(ppd[r]) === orgPcColor) {
          rightMark = rightMark.toUpperCase();
          // uppercase indic. same color collision
        }
      }

      if (l > -1) {
        sjppd[l] = leftMark + ppd[l];
        l--;
      }

      if (r < 64) {
        sjppd[r] = rightMark + ppd[r];
        r++;
      }
    }

    sjppd = sjppd.map(s => {
      let isMarkingJumpOnSameColor = s[0] === 'x';

      isMarkingJumpOnSameColor &&= s[1] != 1;
      isMarkingJumpOnSameColor &&= color(s[1]) === orgPcColor;

      if (isMarkingJumpOnSameColor) {
        return 'X' + s[1];
      }

      return s;
    });

    return sjppd;
  }

  sjpd(ppd, ppdIdxOfOrg, maxPcsMarkedPerRay) {
    return this.slideJumpAndPiecePlacementData(
      ppd, ppdIdxOfOrg, maxPcsMarkedPerRay
    ).map(s => s[0]).join('');
  }

  sjppd(ppd, ppdIdxOfOrg, maxPcsMarkedPerRay) {
    return this.slideJumpAndPiecePlacementData(
      ppd, ppdIdxOfOrg, maxPcsMarkedPerRay
    );
  }

  rays(sjppd) {
    const ppdIdxOfOrg = sjppd.map(s => s[0]).indexOf('o');
    const sjppdSplitOnOrg = [
      sjppd.slice(0, ppdIdxOfOrg).reverse(),
      sjppd.slice(ppdIdxOfOrg + 1)
    ];
    const ppdIdxSplitOnOrg = [
      sjppd.slice(0, ppdIdxOfOrg).map( (s, i, arr) => {
        return [arr.length, i];
      }).reverse(),
      sjppd.map( (s, i) => i ).slice(ppdIdxOfOrg + 1).map( (v, i) => {
        return [ v - i - 1, v ];
      })
    ];
    const componentsAreEqual = o => {
      return o[1] % 8 - o[0] % 8 === parseInt(o[0] / 8) - parseInt(o[1] / 8);
    };
    const componentsAreEqualAndOpp = o => {
      return o[1] % 8 - o[0] % 8 === parseInt(o[1] / 8) - parseInt(o[0] / 8);
    };
    const rays = Array.from( {length: 8}, v => new Object() );

    for (let marks, ids, dirByMark, dirByXY, len, t = 0; t < 8; t++) {
      Object.assign(rays[t], { ray: [], slides: [] });
      marks = sjppdSplitOnOrg[parseInt(t / 4)];
      ids = ppdIdxSplitOnOrg[parseInt(t / 4)];

      switch (t % 4) {
        case 0:
          dirByMark = s => s.match(/d/i) != null;
          dirByXY = componentsAreEqual;
          break;
        case 1:
          dirByMark = s => s.match(/f/i) != null;
          dirByXY = o => o[1] % 8 - o[0] % 8 === 0;
          break;
        case 2:
          dirByMark = s => s.match(/a/i) != null;
          dirByXY = componentsAreEqualAndOpp;
          break;
        case 3:
          dirByMark = s => s.match(/l/i) != null;
          dirByXY = o => parseInt(o[0] / 8) - parseInt(o[1] / 8) === 0;
          break;
      }

      rays[t].ray = marks.filter(dirByMark);
      len = rays[t].ray.length;
      rays[t].slides = ids.filter(dirByXY).map(o => o[1]).slice(0, len);
    }

    return rays;
  }

  get whiteHasTheMove() {
    return this.activeColor === 'w';
  }

  get activeKingFE() {
    return this.whiteHasTheMove ? 'K' : 'k';
  }

  get ppdIdxOfActiveKing() {
    return this.ppd.indexOf(this.activeKingFE);
  }

  get sjppdOnActiveKing() {
    return this.sjppd(this.ppd, this.ppdIdxOfActiveKing, 2);
  }

  get sjToActiveKing() {
    return this.sjpd(this.ppd, this.ppdIdxOfActiveKing, 2);
  }

  get raysOnActiveKing() {
    return this.rays(this.sjppdOnActiveKing);
  }

  get inactiveKnightFE() {
    return this.whiteHasTheMove ? 'n' : 'N';
  }

  get activeQueenFE() {
    return this.whiteHasTheMove ? 'Q' : 'q';
  }

  piecePattern(kingEvent, indexOfRay) {
    let patternIndex;

    if (indexOfRay % 2 === 0) { // diagonal
      if (kingEvent === 'check') { // check on diagonal
        patternIndex = 1 + parseInt(indexOfRay / 4);
        // div 4 is 0 for ray going up in rank from org
        // div 4 is 1 for ray going down in rank from org
      } else {
        patternIndex = 0; // pin on diagonal
      }
    } else if (kingEvent === 'check') { // rank-n-file and check
      patternIndex = 0;
    } else { // rank-n-file and pin
      patternIndex = 1;
    }

    return this.REGX[kingEvent][this.activeColor][patternIndex];
  }

  eventRays(sjppd, kingEvent) {
    const rays = this.rays(sjppd);
    const king = this.activeKingFE;
    const kingEventsByRay = Array.from({length: 8}, v => []);

    for (let evt, r, t = 0; t < 8; t++) {
      r = king + rays[t].ray.map(s => s[1]).join('');
      evt = r.match( this.piecePattern(kingEvent, t) );

      if (evt == null) {
        continue;
      }

      evt = [ 0, r.indexOf(evt.groups.attacker) ];
      kingEventsByRay[t] = rays[t].slides.slice(...evt);
    }

    return kingEventsByRay;
  }

  get activeKingIsInCheck() {
    const sjppd = this.sjppdOnActiveKing;

    return (sjppd.indexOf('x' + this.inactiveKnightFE) > -1 ||
      this.eventRays(sjppd, "check").some(v => v != null)
    );
  }

  isNotAttacked(ppdIdxOfDest) {
    const ppArr = this.ppdLength64NoSlashChars.split('');
    let sjppd;

    // move the king
    ppArr.splice(this.ppdIdxOfActiveKing, 1, '1');
    ppArr.splice(ppdIdxOfDest, 1, this.activeKingFE);

    // graph attacks on king in new location
    sjppd = this.sjppd(ppArr.join(''), ppdIdxOfDest, 1);

    return ( sjppd.indexOf('x' + this.inactiveKnightFE) > -1 ||
      this.eventRays(sjppd, "check").some(v => v != null) ) === false;
  }

  isUpperCase(str) {
    return str.match(/[A-Z]/);
  }

  isLowerCase(str) {
    return str.match(/[a-z]/);
  }

  get castlingData() {
    const sides = this.castlingAvailability.split('');
    const black = s => this.isLowerCase(s)
    const white = s => this.isUpperCase(s);
    const colorFilter = this.whiteHasTheMove ? white : black;
    const availability = sides.filter(colorFilter).join('');
    const kingside = this.whiteHasTheMove ? 62 : 6;
    const rightMove = this.whiteHasTheMove ? 61 : 5;
    const queenside = this.whiteHasTheMove ? 58 : 2;
    const leftMove = this.whiteHasTheMove ? 59 : 3;

    return { availability, rightMove, kingside, leftMove, queenside };
  }

  get kingLegalMoves() {
    const rays = this.raysOnActiveKing;
    const { availability, kingside, queenside, rightMove, leftMove
    } = this.castlingData;
    const dests = [];
    const legalMoves = [];

    /* legalization step #1, no same-color collisions, i.e.,
    * all destinations are empty and enemy-occupied squares.
    */
    for (let i = 0; i < rays.length; i++) {
      if (rays[i].ray.length === 0) {
        continue;
      }

      /* cap marks indicate same color collision,
      * and king may only move to adjacent squares,
      * thus use ray[0] and slides[0] for destinations
      */
      if (this.isUpperCase(rays[i].ray[0][0]) === false) {
        dests.push(rays[i].slides[0]);
      }
    }

    // legalization step #2, only unattacked destinations
    for (let i = 0; i < dests.length; i++) {
      if ( this.isNotAttacked(dests[i]) ) {
        legalMoves.push(dests[i]);
      }
    }

    if (availability.includes(this.activeKingFE) &&
      legalMoves.includes(rightMove) &&
      this.ppd[rightMove] == 1 &&
      this.ppd[kingside] == 1
    ) {
      if ( this.isNotAttacked(kingside) ) {
        legalMoves.push(kingside);
      }
    }

    if (availability.includes(this.activeQueenFE) &&
      legalMoves.includes(leftMove) &&
      this.ppd[leftMove] == 1 &&
      this.ppd[queenside] == 1
    ) {
      if ( this.isNotAttacked(queenside) ) {
        legalMoves.push(queenside);
      }
    }

    return legalMoves;
  }

  get countOfChecks() {
    const sjppd = this.sjppdOnActiveKing;
    const enemyKnightFE = this.inactiveKnightFE;
    let countOfChecks = this.eventRays(sjppd, "check");

    countOfChecks = countOfChecks.map(o => o.length);
    countOfChecks = countOfChecks.map(v => v ? 1 : 0);
    countOfChecks = countOfChecks.reduce( (pre, cur) => pre + cur );
    countOfChecks += sjppd.indexOf('x', enemyKnightFE) > -1 ? 1 : 0;

    return countOfChecks;
  }

  filterConstraint(moves, ppdIdxOfPc) {
    const sjppd = this.sjppdOnActiveKing;
    const enemyKnightFE = this.inactiveKnightFE;
    const slideChecks = this.eventRays(sjppd, "check");
    const jumpCheck = [ sjppd.indexOf('x', enemyKnightFE) ];
    const absPins = this.eventRays(sjppd, "absolutePin");

    if (this.countOfChecks === 1) {
      let constraint;

      if (jumpCheck[0] > -1) {
        constraint = jumpCheck;
      } else {
        constraint = slideChecks.filter( o => o.length > 0 )[0];
      }

      return moves.filter(x => constraint.includes(x));
    }

    for (let i = 0; i < absPins.length; i++) {
      if (absPins[i].length === 0) {
        continue;
      }

      if ( absPins[i].some(x => x === ppdIdxOfPc) ) {
        return moves.filter(x => absPins[i].includes(x));
      }
    }

    return moves;
  }

  pawnLegalMoves(ppdIdxOfPc) {
    if (this.countOfChecks > 1) {
      return [];
    }

    const [ x0, y0 ] = this.toChessCartesian(ppdIdxOfPc);
    const yAdv = this.whiteHasTheMove ? y0 + 1 : y0 - 1;
    const yInit = this.whiteHasTheMove ? 1 : 6;
    const advance = this.toPpdIdx(x0, yAdv);
    const yBonus = this.whiteHasTheMove ? yAdv + 1 : yAdv - 1;
    const bonus = this.toPpdIdx(x0, yBonus);
    const enemyColor = this.whiteHasTheMove ? 'b' : 'w';
    const moves = [];
    let piece, captureLeft, captureRight;

    piece = this.ppd[advance];

    if (piece == 1) {
      moves.push(advance);

      if (y0 === yInit) {
        piece = this.ppd[bonus];

        if (piece == 1) {
          moves.push(bonus);
        }
      }
    }

    if (x0 > 0) {
      captureLeft = this.toPpdIdx(x0 - 1, yAdv);
      piece = this.ppd[captureLeft];

      if (this.toPieceColor(piece) === enemyColor ||
          this.toAN(captureLeft) === this.epts
      ) {
        moves.push(captureLeft);
      }
    }

    if (x0 < 7) {
      captureRight = this.toPpdIdx(x0 + 1, yAdv);
      piece = this.ppd[captureRight];

      if (this.toPieceColor(piece) === enemyColor ||
          this.toAN(captureRight) === this.epts
      ) {
        moves.push(captureRight);
      }
    }

    return this.filterConstraint(moves);
  }

  knightLegalMoves(ppdIdxOfKnight) {
    if (this.countOfChecks > 1) {
      return [];
    }

    const moves = this.sjpd(this.ppd, ppdIdxOfKnight, 1
    ).split('').map( (s, i) => s === 'x' ? i : s ).filter( v => !isNaN(v) );

    return this.filterConstraint(moves);
  }

  bqrLegalMoves(ppdIdxOfPc) {
    const pieceInFEN = this.ppd[ppdIdxOfPc];
    const rays = this.rays( this.sjppd(this.ppd, ppdIdxOfPc, 1) );
    const ends = rays.map(o => {
      for (let i = 0; i < o.ray.length; i++) {
        if ( o.ray[i].match(/[adfl]\w/) ) {
          return i + 1;
        }

        if ( o.ray[i].match(/[ADFL]\w/) ) {
          return i;
        }
      }
    });
    let slides = [];

    for (let i = 0; i < rays.length; i++) {
      slides[i] = rays[i].slides.slice(0, ends[i])
    }

    if ( pieceInFEN.match(/b/i) ) {
      slides = slides.filter( (o, i) => i % 2 === 0 );
    } else if ( pieceInFEN.match(/r/i) ) {
      slides = slides.filter( (o, i) => i % 2 === 1 );
    }

    return this.filterConstraint( slides.flat() )
  }

  get allMovesStr() {
    const ppd = this.ppdLength64NoSlashChars;
    const moves = [];

    for (let pc, i = 0; i < ppd.length; i++) {
      pc = ppd[i];

      if (pc == 1 || this.toPieceColor(pc) !== this.activeColor) {
        moves[i] = [];
        continue;
      }

      if ( pc.match(/k/i) ) {
        moves[i] = this.kingLegalMoves;
      } else if ( pc.match(/p/i) ) {
        moves[i] = this.pawnLegalMoves(i);
      } else if ( pc.match(/n/i) ) {
        moves[i] = this.knightLegalMoves(i)
      } else {
        moves[i] = this.bqrLegalMoves(i);
      }

      if (moves[i].length) {
        moves[i] = moves[i].map(x => this.AN[x]);
      }
    }

    return JSON.stringify(moves);
  }

  get movesByAN() {
    const moves = JSON.parse(this.allMovesStr);
    const AN = this.AN;
    const nAMap = new Map();

    for (let i = 0; i < 64; i++) {
      nAMap.set(AN[i], moves[i]);
    }

    return nAMap;
  }

  get countOfMoves() {
    return JSON.parse(this.allMovesStr).map(o => o.length).reduce((a, b) => {
      return a + b;
    });
  }

  graphSlideJumpAndPiecePlacementData(sjpd, ppd) {
    for (let rank, i = 0; i < 64; i++) {
      if (i === 0) {
        console.log();
      }
      if (i % 8 === 0) {
        rank = '12345678'[7 - i / 8] + '  ';
      }

      if (ppd[i] != 1) {
        rank += ppd[i];
      } else {
        rank += '.';
      }

      if (sjpd[i] === '.') {
        rank += '  ';
      } else {
        rank += sjpd[i] + ' ';
      }

      if (i % 8 === 7) {
        console.log(rank);
      }

      if (i + 1 === 64) {
        console.log('   ' + 'abcdefgh'.split('').join('  ') + '\n');
      }
    }
  }

  sjppdGraph(sjpd, ppd) {
    this.graphSlideJumpAndPiecePlacementData(sjpd, ppd);
  }

  graph() {
    this.sjppdGraph(this.sjToActiveKing, this.ppd);
  }

  graphLegalMoves(x, y) {
    const index = this.toPpdIdx(x, y);

    const selectedMoves = JSON.parse(this.allMovesStr)[index];
    let mpd = '';

    for (let i = 0; i < this.ppd.length; i++) {
      if (i === index) {
        mpd += 'o';
      } else if (selectedMoves.includes[i]) {
        mpd += 'm';
      } else {
        mpd += '.';
      }
    }

    this.graphSlideJumpAndPiecePlacementData(mpd, this.ppd);
  }

  disambiguationStr(move) {
    /* Pawn may always be identified by dest or dest & departure file,
    and there can only be one king, but, bishops, knights, & rooks have
    twins, and pawn promotion can create twin queen or rare triplets. */
    if ( move.nFEOnOrg.match(/[kp]/i) ) {
      return '';
    }

    const ppArr = this.ppdLength64NoSlashChars.split('');
    let idxOfTwin, nAOfTwin;
    let idxOfTriplet, nAOfTriplet;
    let disambiguationStr = '';
    let str2;

		ppArr.splice(move.ppdIdxOfOrg, 1, 'M'); // Mask moving piece and if
		idxOfTwin = ppArr.indexOf(move.nFEOnOrg); // find same that's the twin.
    idxOfTriplet = ppArr.lastIndexOf(move.nFEOnOrg); // promotion-caused, rare

    if (idxOfTwin < 0) {
      return '';
    }

    const allMoves = JSON.parse(this.allMovesStr);

		if ( allMoves[idxOfTwin].includes(nAOfDest) ) {
		  nAOfTwin = this.toAN(idxOfTwin);

		  if (move.nAOfOrg[0] !== nAOfTwin[0]) {
			  disambiguationStr = move.nAOfOrg[0];
		  } else if (move.nAOfOrg[1] !== nAOfTwin[1]) {
			  disambiguationStr = move.nAOfOrg[1];
		  }
		}

    if (idxOfTwin !== idxOfTriplet &&
      allMoves[idxOfTwin].includes(nAOfDest) &&
      allMoves[idxOfTriplet].includes(nAOfDest)
    ) {
      nAOfTriplet = this.toAN(idxOfTriplet);

      if (move.nAOfOrg[0] !== nAOfTriplet[0]) {
			  str2 = move.nAOfOrg[0];
		  } else if (move.nAOfOrg[1] !== nAOfTriplet[1]) {
			  str2 = move.nAOfOrg[1];
		  }

      if (str2 !== disambiguationStr) {
        disambiguationStr = move.nAOfOrg;
      }
    }

    return disambiguationStr;
  }

  resultOfMoves(movesMade) {
    const ppArr = this.ppdLength64NoSlashChars.split('');
    let ppd;
    let xppd = this.xppd;
    let [ , ac, ca, epts ] = this.fieldsOfFEN;
    let m, key;
    let i = 0;

    while (i < movesMade.length) {
      m = movesMade[i++];

      // Make the move
      ppArr.splice(m.ppdIdxOfOrg, 1, '1');
      ppArr.splice(m.ppdIdxOfDest, 1, m.nFEOnOrg);

      // Remove and record pawn captured en passant
      if (m.pawnIsMoving && m.nAOfDest === epts) {
        ppArr.splice(m.ppdIdxOfDest + (m.whiteIsMoving ? 8 : -8), 1, '1');
        xppd += m.movingIsWhite ? 'p' : 'P';
      } else if (m.nFEOnDest != 1) {
      // Record non-ep capture
        xppd += m.nFEOnDest;
      }

      // Castling rook movement
      if (m.isCastlingKingside || m.isCastlingQueenside) {
        let { nFEOfRook, idxOfOrg, idxOfDest } = m.kingsideRookData;

        if (nFEOfRook == undefined) {
          ( { nFEOfRook, idxOfOrg, idxOfDest } = m.queensideRookData );
        }

        ppArr.splice(idxOfOrg, 1, '1');
        ppArr.splice(idxOfDest, 1, nFEOfRook);
      }

      // Apply pawn promotion choice
      if (m.pawnReachedPromotionRank) {
        ppArr.splice(m.ppdIdxOfDest, 1, m.promotionChoiceInFEN);
      }

      // active color toggles black and white
      ac = ac === 'w' ? 'b' : 'w';

      /* update castling availability */

      if (ca !== '-' && m.kingIsMoving) {
        ca = ca.replace(m.whiteIsMoving ? 'KQ' : 'kq', '');
      }

      if (ca !== '-' && (key = m.whiteRookEventKey) > -1) {
        ca = ca.replace([ 'K', 'Q' ][key % 2], '');
      }

      if (ca !== '-' && (key = m.blackRookEventKey) > -1) {
        ca = ca.replace([ 'k', 'q' ][key % 2], '');
      }

      if (ca.length === 0) {
        ca = '-';
      }

      // set en passant target square
      if (m.pawnUsedBonusInitAdvance) {
        epts = m.nAOfOrg[0] + (m.whiteIsMoving ? 3 : 6);
      } else {
        epts = '-';
      }
    }

    /* write the final ppd, step 1:
    restore slashes w/o changing array length */
    for (let i = 0; i < 64; i++) {
      if (i > 0 && i % 8 === 0) {
        ppArr.splice(i, 1, '/' + ppArr[i]);
      }
    }

    /* write the final ppd, step 2:
    sum consecutive empty square indicators */
    ppd = ppArr.join('').replace(/11+/g, match => match.length);

    return new ChessPosition([ ppd, ac, ca, epts ].join(' '), xppd);
  }
}
