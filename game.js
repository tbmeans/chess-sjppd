export default class ChessGame {
  NOTIFICATIONS = {
    isGameOver: false,
    winBy: '',
    loseBy: '',
    drawBy: '',
    isWinForWhite: false,
    pgn: "",
    whiteHasTheMove: true,
    isCheck: false
  };

  PGNSTR = {
    event: '?',
    site: '?',
    date: ( new Date() ).toJSON().slice(0, 10).replace(/-/g, '.'),
    round: '?',
    white: '',
    black: '',
    result: ''
  };

  pgnPrint(pgnSTRObj, formattedMovetext) {
    const tagNames = Object.keys(pgnSTRObj).map(s => {
      return s[0].toUpperCase() + s.slice(1);
    });
    const tagValues = Object.values(pgnSTRObj);
    const valWrap = s => '"' + s + '"';
    const tags = [];

    for (let i = 0; i < tagNames.length; i++) {
      tags.push([
        (i === 0 ? '[' : '') + tagNames[i],
        valWrap(tagValues[i]) + (i === tagNames.length - 1 ? ']' : '')
      ].join(' '));
    }

    return tags.join(']\n[') + '\n\n' + formattedMovetext;
  }

  under80CharsPerLine(tokens) {
		var nextCount;
		var lineCharCount = 0;
		var lineStartIndex = 0;
		var spaceCount = 1;
		var lines = [];
		for (var i = 0; i < tokens.length; i++) {
			nextCount = lineCharCount + tokens[i].length;
			if (nextCount < 80) {
				lineCharCount = nextCount;
			} else {
				lines.push(tokens.slice(lineStartIndex, i));
				/* current token didn't fit so finalized current line
				*/
				if (i === tokens.length - 1) { /* final token */
					lines.push(tokens[i]);
					/* finalized the next and final line
					*/
				} else { /* initialize next line */
					lineStartIndex = i;
					lineCharCount = tokens[i].length;
				}
				continue;
			}
			/* Current token fits on line.
				If there's a next token, will it also fit? */
			if (i + 1 < tokens.length) {
				nextCount = lineCharCount + spaceCount + tokens[i + 1].length;
				if (nextCount > 79) { /* next token doesn't fit */
					lines.push(tokens.slice(lineStartIndex, i + 1));
					lineStartIndex = i + 1;
					lineCharCount = 0;
				} else { /* next token fits */
					lineCharCount++; /* count the join space */
				}
			} else { /* There's no next token so add the final line. */
				lines.push(tokens.slice(lineStartIndex));
			}
		}
		for (var i = 0; i < lines.length; i++) {
			lines[i] = lines[i].join(' ') + '\n';
		}
		return lines.join('');
	}

	constructor(initPosition, usernameWhite, usernameBlack) {
    this.initPosition = initPosition;
    this.curPosition = initPosition;
    this.halfmoveClock = 0;
    this.fullmoveNumber = 1;
    this.sequenceOfMovesMade = [];
    this.movetext = initPosition.activeColor === 'b' ? [ "1.", "..." ] : [];
    this.endName = '';
    this.capturesInUnicode = "";
    this.usernameWhite = usernameWhite;
    this.usernameBlack = usernameBlack;
	}

  get seq() {
    return this.sequenceOfMovesMade;
  }

  set seq(arr) {
    this.sequenceOfMovesMade = arr;
  }

  get fullFEN() {
    return this.curPosition.fieldsOfFEN.push(this.hmc, this.fmn).join(' ');
  }

	get hmc() {
	  return this.halfmoveClock;
	}

	set hmc(x) {
	  this.halfmoveClock = x;
	}

	get fmn() {
	  return this.fullmoveNumber;
	}

	set fmn(x) {
	  this.fullmoveNumber = x;
	}

  pushMove(moveData) {
    this.sequenceOfMovesMade.push(moveData);
  }

  popMove() {
    this.sequenceOfMovesMade.pop();
  }

  *positionsAfter(idxOfMoveInSeq) {
    while (idxOfMoveInSeq < this.sequenceOfMovesMade.length) {
      yield this.initPosition.resultOfMoves(
        this.sequenceOfMovesMade.slice(0, idxOfMoveInSeq++)
      );
    }
  }

  get hasReachedThreefoldRep() {
    const repeatables = [];
    let lastIrreversible;
    let i = this.sequenceOfMovesMade.length - 1;

    while (i > -1) {
      if (this.sequenceOfMovesMade[i].isReversible === false) {
        lastIrreversible = i;
        break;
      };

      i--;
    }

    for ( const result of this.positionsAfter(lastIrreversible) ) {
      repeatables.push(result);
    }

    for (let item, list, i = 0; i < repeatables.length; i++) {
      item = repeatables[i];
      list = repeatables.slice(i + 1); // remove item to find other occurrence

      if (item != undefined && list.length > 0 &&
        list.indexOf(item) !== list.lastIndexOf(item)
      ) {
        return true;
      }
	  }

    return false;
  }

  insufficientMaterialStatus(position) {
    const ppdArr = position.ppdLength64NoSlashChars.split('');
    const w = insufficientMaterial(
      ppdArr.filter( s => 'BKNPQR'.includes(s) ),
      'w'
    );
    const b = insufficientMaterial(
      ppdArr.filter( s => 'bknpqr'.includes(s) ),
      'b'
    );

    return {w, b};

    function insufficientMaterial(arr, color) {
      const draw1 = arr.length === 1;
      const draw2 = arr.length === 2;
      const draw3 = arr.length === 3;
      const king = color === 'w' ? 'K' : 'k';
      const bishop = color === 'w' ? 'B' : 'b';
      const knight = color === 'w' ? 'N' : 'n';
      const draw2A = arr.includes(knight);
      const draw2B = arr.includes(bishop);
      const k2n = arr.every(s => s === king || s === knight);

      return draw1 || (draw2 && (draw2A || draw2B)) || (draw3 && k2n);
    }
  }

  get isDeadPosition() {
    const insuffMat = this.insufficientMaterialStatus(this.curPosition);

    return insuffMat.w && insuffMat.b;
  }

  get curMove() {
    return this.seq[this.seq.length - 1];
  }

  set curMove(moveMade) {
    this.pushMove(moveMade);

    const token = moveMade.movetext[0] +
    this.curPosition.disambiguationStr(moveMade) + moveMade.movetext.slice(1);

    this.curPosition = this.initPosition.resultOfMoves(
      this.sequenceOfMovesMade
    );

    if (moveMade.isClocked) {
      this.hmc = this.hmc + 1;
    } else {
      this.hmc = 0;
    }

    const isCheck = this.curPosition.activeKingIsInCheck;
    const moveCount = this.curPosition.countOfMoves;
    let endMark = '';
    let gameTerminationMarker = '';

    if (isCheck && moveCount > 0) {
      endMark = '+';
    } else if (isCheck && moveCount === 0) {
      endMark = '#';
      gameTerminationMarker = moveMade.whiteIsMoving ? '1-0' : '0-1';
      this.endName = 'checkmate';
    } else if (moveCount === 0) {
      gameTerminationMarker = '1/2-1/2';
      this.endName = 'stalemate';
    } else if (this.hmc == 50) {
      gameTerminationMarker = '1/2-1/2';
      this.endName = '50-move rule';
    } else if (this.hasReachedThreefoldRep) {
      gameTerminationMarker = '1/2-1/2';
      this.endName = '3-fold rept';
    } else if (this.isDeadPosition) {
      gameTerminationMarker = '1/2-1/2';
      this.endName = 'dead pos.';
    }

    if (moveMade.whiteIsMoving) {
      this.movetext.push(this.fmn + '.', token + endMark);
    } else {
      this.movetext.push(token + endMark);
      this.fmn = this.fmn + 1;
    }

    if (gameTerminationMarker.length > 0) {
      this.movetext.push(gameTerminationMarker);
    }

    this.capturesInUnicode = this.curPosition.xppd.map(s => {
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
    });
  }

  get pgnMovetext() {
    return this.under80CharsPerLine(this.movetext);
  }

  undoLastMove() {
    const lastMove = this.popMove();

    this.curPosition = this.initPosition.resultOfMoves(
      this.sequenceOfMovesMade
    );

    if (this.hmc > 0) {
      this.hmc = this.hmc - 1;
    } else {
      let total = 0;
      let i = 0;

      while (i < this.sequenceOfMovesMade - 1) {
        if (this.sequenceOfMovesMade[i++].isClocked) {
          total++;
        } else {
          total = 0;
        }
      }

      this.hmc = total;
    }

    if (lastMove.whiteIsMoving === false) {
      this.fmn = this.fmn - 1;
    }

    if (this.endName.length > 0) {
      this.movetext.pop(); // the game term. marker
      this.endName = '';
    }

    this.movetext.pop(); // the actual move

    if (lastMove.whiteIsMoving) {
      this.movetext.pop(); // the move number indication
    }

    if (lastMove.isCapture) {
      this.capturesInUnicode = this.capturesInUnicode.slice(
        0, this.capturesInUnicode.length - 1
      );
    }
  }

  get startReport() {
    const report = Object.create(this.NOTIFICATIONS);
    const pgnSTR = Object.create(this.PGNSTR);
    const activeColor = this.curPosition.activeColor;

    for (const note in this.NOTIFICATIONS) {
      report[note] = this.NOTIFICATIONS[note];
    }

    for (const tagName in this.PGNSTR) {
      pgnSTR[tagName] = this.PGNSTR[tagName];
    }

    if (activeColor === 'w') {
      report.whiteHasTheMove = true;
    }

    return { report, pgnSTR }
  }

	get moveMadeReport() {
    const { report, pgnSTR } = this.startReport;
    const token = this.movetext[this.movetext.length - 1];

    if ( token.includes('+') ) {
      report.isCheck = true;
    }

    if ( token.match(/[0-2]-/) ) {
      report.isGameOver = true;

      if ( token.match(/[0-1]-/) ) {
        report.isWinForWhite = token === '1-0';
        report.winBy = this.endName;
        report.loseBy = this.endName + 'd';
      } else {
        report.drawBy = this.endName;
      }

      pgnSTR.white = this.usernameWhite;
      pgnSTR.black = this.usernameBlack;
      pgnSTR.result = token;
      report.pgn = this.pgnPrint(pgnSTR, this.pgnMovetext);
    }

	  return report;
	}

  get reportOnEndBeforeMoveMade() {
    const { report, pgnSTR } = this.startReport;
    const token = this.movetext[this.movetext.length - 1];

    report.isWinForWhite = token === '1-0';
    pgnSTR.white = this.usernameWhite;
    pgnSTR.black = this.usernameBlack;
    pgnSTR.result = token;
    report.pgn = this.pgnPrint(pgnSTR, this.pgnMovetext);

    if ( token.match(/1\/2/) ) {
      report.loseBy = this.endName;
      report.drawBy = 'insuff. mat.';
    } else {
      report.winBy = "forfeit";
      report.loseBy = this.endName;
    }

    return report;
  }

  set reportOnEndBeforeMoveMade(endName) {
    this.endName = endName;

    const activeColor = this.curPosition.activeColor;

    if ( endName.match(/resign/i) ) {
      this.movetext.push(activeColor === 'w' ? '0-1' : '1-0');

      return;
    }

    /* In the following, ending is flag fall i.e. time ran out */

    const insuffMat = this.insufficientMaterialStatus(this.curPosition);
    const loserTemp = activeColor;
    const winnerTemp = activeColor === 'w' ? 'b' : 'w';

    if (insuffMat[winnerTemp]) {
      this.movetext.push('1/2-1/2');
    } else {
      this.movetext.push(loserTemp === 'w' ? '0-1' : '1-0');
    }
  }

  get isOver() {
    return this.endName.length > 0;
  }
}
