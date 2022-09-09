import assert from 'assert/strict'
import { captureRejectionSymbol } from 'events'

import engine from '../engine.js'

const { PGNSevenTagRoster, getGameStatus } = engine;

const egHalfmoves = "e2e4,e7e5,g1f3,b8c6,f1c4,f8c5,b2b4,c5b4,\
c2c3,b4a5,d2d4,e5d4,e1g1,d4d3,d1b3,d8f6,e4e5,f6g6,f1e1,g8e7,c1a3,b7b5,b3b5,\
a8b8,b5a4,a5b6,b1d2,c8b7,d2e4,g6f5,c4d3,f5h5,e4f6,g7f6,e5f6,h8g8,a1d1,h5f3,\
e1e7,c6e7,a4d7,e8d7,d3f5,d7e8,f5d7,e8f8,a3e7";

const egSAN = "1. e4 e5 2. Nf3 Nc6 3. Bc4 Bc5 4. b4 Bxb4 5. c3 Ba5 6. d4 \
exd4 7. O-O d3 8. Qb3 Qf6 9. e5 Qg6 10. Re1 Nge7 11. Ba3 b5 12. Qxb5 Rb8 13. \
Qa4 Bb6 14. Nbd2 Bb7 15. Ne4 Qf5 16. Bxd3 Qh5 17. Nf6+ gxf6 18. exf6 Rg8 19. \
Rad1 Qxf3 20. Rxe7+ Nxe7 21. Qxd7+ Kxd7 22. Bf5+ Ke8 23. Bd7+ Kf8 24. Bxe7# \
1-0";

const listStat = {
  evaluatesEvergreenGameMoveSequenceToWhiteWinByCheckmate() {
    assertWithErrHandling(
      egHalfmoves,
      Object.freeze(new PGNSevenTagRoster),
      {
        white: "Made move",
        black: "checkmate",
        movetext: egSAN,
        gameover: "Mate: white wins"
      }
    );
  }
};

export default listStat;

function assertWithErrHandling(moveSeq, pgn, expected) {
  const fullStatus = JSON.parse( getGameStatus(moveSeq, pgn) );
  const actual = {
    white: fullStatus.white,
    black: fullStatus.black,
    movetext: fullStatus.movetext,
    gameover: fullStatus.gameover
  };

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
