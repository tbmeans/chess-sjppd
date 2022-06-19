export default class ChessMove {
  constructor(orgData, destData, promotionChoiceInSAN) {
    this.ppdIdxOfOrg = orgData.ppdIdx;
    this.nAOfOrg = orgData.nA;
    this.nFEOnOrg = orgData.nFE;
    this.ppdIdxOfDest = destData.ppdIdx;
    this.nAOfDest = destData.nA;
    this.nFEOnDest = destData.nFE;
    this.promotionChoiceInSAN = promotionChoiceInSAN;
  }

  static fromStringification(str) {
    const data = JSON.parse(str);
    const orgData = {};
    const destData = {};
    let inputKey;

    for (const key in data) {
      if ( key.includes("Org") ) {
        inputKey = key.slice( 0, key.indexOf("O") );
        orgData[inputKey] = data[key];
      } else {
        inputKey = key.slice( 0, key.indexOf("O") );
        destData[inputKey] = data[key];
      }
    }

    return ChessMove(orgData, destData);
  }

  get pawnIsMoving() {
    return this.nFEOnOrg.match(/p/i);
  }

  get kingIsMoving() {
    return this.nFEOnOrg.match(/k/i);
  }

  get whiteIsMoving() {
    return this.nFEOnOrg.toUpperCase() === this.nFEOnOrg;
  }

  get pawnDepartedFromInit() {
    return (this.pawnIsMoving &&
      ( this.nAOfOrg[1] === (this.whiteIsMoving ? 2 : 7) )
    );
  }

  get pawnUsedBonusInitAdvance() {
    return this.pawnDepartedFromInit && (Math.abs(
      this.nAOfDest[1] - this.nAOfOrg[1]
    ) === 2);
  }

  rookEvent(rookFE) {
    return [
      this.nFEOnOrg === rookFE && this.nAOfOrg[0] === 'h',
      this.nFEOnOrg === rookFE && this.nAOfOrg[0] === 'a',
      this.nFEOnDest === rookFE && this.nAOfDest[0] === 'h',
      this.nFEOnDest === rookFE && this.nAOfDest[0] === 'a'
    ];
  };

  get whiteRookEventKey() {
    return this.rookEvent('R').indexOf(true);
  }

  get blackRookEventKey() {
    return this.rookEvent('r').indexOf(true);
  }

  get diffIdx() {
    return this.ppdIdxOfDest - this.ppdIdxOfOrg;
  }

  get pawnReachedPromotionRank() {
    return this.pawnIsMoving && this.nAOfDest[1] === (
      this.whiteIsMoving ? 8 : 1
    );
  }

  get promotionChoiceInFEN() {
    if (this.promotionChoiceInSAN == undefined) {
      return;
    }

    if (this.whiteIsMoving) {
      return m.promotionChoiceInSAN;
    }

    return m.promotionChoiceInSAN.toLowerCase();
  }

  get pawnIsMovingDiagonally() {
    return this.pawnIsMoving && this.nAOfDest[0] !== this.nAOfOrg[0];
  }

  get isCastlingKingside() {
    return this.kingIsMoving && this.diffIdx === 2;
  }

  get isCastlingQueenside() {
    return this.kingIsMoving && this.diffIdx === -2
  }

  get kingsideRookData() {
    let nFE, idxOfOrg, idxOfDest;

    if (this.isCastlingKingside) {
      nFE = this.whiteIsMoving ? 'R' : 'r';
      idxOfOrg = this.whiteIsMoving ? 63 : 7;
      idxOfDest = this.whiteIsMoving ? 61 : 5;
    }

    return { nFE, idxOfOrg, idxOfDest };
  }

  get queensideRookData() {
    let nFE, idxOfOrg, idxOfDest;

    if (this.isCastlingQueenside) {
      nFE = this.whiteIsMoving ? 'R' : 'r';
      idxOfOrg = this.whiteIsMoving ? 56 : 0;
      idxOfDest = this.whiteIsMoving ? 59 : 3;
    }

    return { nFE, idxOfOrg, idxOfDest };
  }

  get isCapture() {
    return this.nFEOnDest != 1 || this.pawnIsMovingDiagonally;
  }

  get movetext() {
    if (this.kingIsCastlingKingside) {
      return (this.whiteIsMoving ? '. ' : '') + "O-O";
    }

    if (this.kingIsCastlingQueenside) {
      return (this.whiteIsMoving ? '. ' : '') + "O-O-O";
    }

    let token = this.nAOfDest;

    if (this.isCapture) {
      token = 'x' + token;
    }

    if (this.pawnIsMoving) {
      if ( token.includes('x') ) {
        token = this.nAOfOrg[0] + token;
      }

      if (this.pawnReachedPromotionRank) {
        token += '=';
      }
    } else {
      token = this.nFEOnOrg.toUpperCase() + token ;
    }

    return token;
  }

  get isReversible() {
	  return (this.pawnIsMoving || this.isCapture ||
      this.kingIsCastlingKingside || this.kingIsCastlingQueenside
    ) === false;
	}

  get isClocked() {
    return this.pawnIsMoving || this.isCapture === false;
  }
}
