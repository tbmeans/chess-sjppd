import readline from 'readline';

import util from 'util';

import engine from './engine.js';

const { Position, SequenceOfMoves, PGNSevenTagRoster, cpuPlay } = engine;

const pgn = new PGNSevenTagRoster;

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const question = util.promisify(rl.question).bind(rl);

const sideChoice = {
  question: 'Enter your choice of side to play, white or black. ',
  defaultMessage: "Invalid response. Defaulting you to playing white.",
  confirmMessage: "You are playing as %s"
};

const orgChoice = {
  question: 'Enter algebraic notation of the square ' +
  'that the piece you want to move is on. ',
  defaultMessage: "You selected a square with no piece, " +
  "a square on which is a piece with no moves, " +
  "or did not enter valid algebraic notation. " +
  "A piece with a move will be selected for you. " +
  "Here are its moves:",
  confirmMessage: "You selected the %s on %s. Here are its moves:"
};

const pieceNames = {
  B: 'white bishop', K: 'white king', N: 'white knight',
  P: 'white pawn', Q: 'white queen', R: 'white rook',
  b: 'black bishop', k: 'black king', n: 'black knight',
  p: 'black pawn', q: 'black queen', r: 'black rook'
};

const destChoice = {
  question: 'Enter algebraic notation of the square ' +
  'that you wish to move to. ',
  defaultMessage: "You did not select a legal move, " +
  "or did not enter valid algebraic notation. " +
  "A move will now be automatically made for you. Result: ",
  confirmMessage: "You selected to move to %s. Result of your move:"
};

/** Rank-descending list of all algebraic notation:
 * a8, ..., h8, ... , a1, ..., h8,
 * which is the same order as FEN piece placement data.
 */
 const an64 = Object.freeze(
  Array.from(
    {length: 64},
    (v, i) => "abcdefgh"[i % 8] + "87654321"[(i - i % 8) / 8]
  )
);

(async function gameLoop() {
  let choice = await question(sideChoice.question);
  let wbMatch = choice.match(/^w|b/i);
  let selectedBlack;
  let white = 'user';
  let black = 'cpu';
  let game = new SequenceOfMoves;
  let status = game.initStatus;
  let position = game.initPosition;
  let nAMatch = s => s.match(/^[a-h][1-8]/);
  let org = "e2";
  let selMoves;
  let tsq = "e4";
  let pro = '';

  if (wbMatch == null) {
    console.log(sideChoice.defaultMessage);
    selectedBlack = false;
  } else {
    selectedBlack = wbMatch[0].toLowerCase() === 'b';
  }

  if (selectedBlack) {
    white = 'cpu';
    black = 'user';
  }

  pgn.white = white;
  pgn.black = black;

  console.log(
    sideChoice.confirmMessage,
    selectedBlack ? 'Black' : 'White'
  );

  position.plot();
  console.log("White: %s", status.white);
  console.log("Black: N/A");
  console.log();

  if (white === 'cpu') {
    game.setMoveSeq(org + tsq);
    status = game.getCurGameStatus();
    console.log("Computer moved:");
    position = new Position(
      ...status.position.split(' ').slice(0, 5),
      status.captures
    );
    position.plot();
    console.log( status.movetext );
    console.log("White: %s", status.white);
    console.log("Black: %s", status.black);
    console.log();
  }

  for (;;) {
    console.log("Your turn.");
    choice = await question(orgChoice.question);

    if ( choice.match(/^r/i) ) {
      game.setMoveSeq(choice);
      status = game.getCurGameStatus();
      console.log("GAME OVER: \n\t%s\n", status.gameOver);
      console.log( pgn.toString( status.movetext ) );
      break;
    }

    if (nAMatch(choice) == null || status.legalMoves[choice] == null ||
      status.legalMoves[choice].targetSquares.length === 0) {
        console.log(orgChoice.defaultMessage);
        org = Object.keys(status.legalMoves)[
          Object.values(status.legalMoves).map(o => {
            return o.targetSquares.length > 0;
          }).indexOf(true)
        ];
    } else {
      org = choice;
      console.log(
        orgChoice.confirmMessage,
        pieceNames[ status.legalMoves[org].pieceOnOrg ],
        org
      );
    }

    selMoves = status.legalMoves[org].targetSquares;
    position.plot(org, selMoves);
    choice = await question(destChoice.question);

    if (nAMatch(choice) == null || selMoves.indexOf(choice) < 0) {
      console.log(destChoice.defaultMessage);
      tsq = selMoves[0];
    } else {
      console.log(destChoice.confirmMessage, choice);
      tsq = choice;
    }

    if (status.legalMoves[org].pieceOnOrg === 'P' && tsq[1] == 8 ||
      status.legalMoves[org].pieceOnOrg === 'p' && tsq[1] == 1) {
        console.log("Pawn was automatically promoted to queen.");
        pro = 'q';
    }

    game.setMoveSeq(org + tsq + pro);
    status = game.getCurGameStatus();
    position = new Position(
      ...status.position.split(' ').slice(0, 5),
      status.captures
    );
    position.plot();

    if (status.hasOwnProperty('gameOver') === false) {
      console.log( status.movetext );
    }

    console.log( position.getCapturesInUnicode() );
    console.log("White: %s", status.white);
    console.log("Black: %s", status.black);
    console.log();

    if (status.gameOver) {
      console.log("GAME OVER: \n\t%s", status.gameOver);
      pgn.toString( status.movetext );
      break;
    }

    // consider "await" on a promise in which settimeout is run

    game.setMoveSeq( cpuPlay(status.legalMoves) );
    status = game.getCurGameStatus();
    console.log("Computer moved:");
    position = new Position(
      ...status.position.split(' ').slice(0, 5),
      status.captures
    );
    position.plot();

    if (status.hasOwnProperty('gameOver') === false) {
      console.log( status.movetext );
    }

    console.log( position.getCapturesInUnicode() );
    console.log("White: %s", status.white);
    console.log("Black: %s", status.black);
    console.log();

    if (status.gameOver) {
      console.log("GAME OVER: \n\t%s", status.gameOver);
      pgn.toString( status.movetext );
      break;
    }
  }

  rl.close();
})();

/** Render a text chess board to console. Origin squares marked with "o" and target squares marked with an "X".
 * @param {Array} [ppd64] sequence of 64 single character strings representing either a piece on a square or an empty square, in FEN
 * @param {(string|Array)} [origins] a single origin square string in alebraic notation or array of such.
 * @param {Array} [targets] the targetSquares from "rays and nearest not on rays" listing function.
 */
function plot(ppd64, origins, targets) { // REMEMBER TO RUN EXPAND WITH 2ND PARAM TRUE TO GET THE PPD64 TO PUT IN HERE
  const idsOfTS = targets?.flat().map( s =>  an64.indexOf(s) );
  const spacedFiles = Array.from('abcdefgh').join('  ');
  let idsOfOrgs;

  if ( Array.isArray(origins) ) {
    idsOfOrgs = origins.map( s =>  an64.indexOf(s) );
  } else { // a single origin alg. notation string was entered
    idsOfOrgs = [ origins ].map( s =>  an64.indexOf(s) );
  }

  for (let rank, i = 0; i < 64; i++) {
    if (i === 0) {
      console.log();
    }
    if (i % 8 === 0) {
      rank = '87654321'[i / 8] + '  ';
    }
    if (ppd64[i] != 1) {
      rank += ppd64[i];
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
