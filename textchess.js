import readline from 'readline';

import util from 'util';

import engine from './engine.js';

const {
  expand,
  getPieceOn,
  PGNSevenTagRoster,
  getGameStatus,
  cpuPlay
} = engine.ui;

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

(async function gameLoop() {
  let choice = await question(sideChoice.question);
  let wbMatch = choice.match(/^w|b/i);
  let selectedBlack;
  let white = 'user';
  let black = 'cpu';

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

  console.log(
    sideChoice.confirmMessage,
    selectedBlack ? 'Black' : 'White'
  );

  const pgn = Object.freeze( new PGNSevenTagRoster(white, black) );
  const incrCSV = (csv, s) => csv.length ? [ csv, s ].join(',') : s;
  const updatedStatus = g => JSON.parse( getGameStatus(g, pgn) );
  const nAMatch = s => s.match(/^[a-h][1-8]/);
  const getOrgs = lm => lm.split(',').map( n => n.slice(0, 2) );
  const pieceOn = (square, position) => {
    return getPieceOn( square, expand(position.split(' ')[0]) );
  };
  let game = '';
  let status = updatedStatus(game);
  let org = "e2";
  let selMoves;
  let tsq = "e4";
  let pro = '';

  plot(status.position);
  console.log("White: %s\nBlack:", status.white);
  console.log();

  if (white === 'cpu') {
    game = incrCSV(game, org + tsq);
    status = updatedStatus(game);
    console.log("Computer moved:");
    plot(status.position);
    console.log( status.movetext );
    console.log("White: %s", status.white);
    console.log("Black: %s", status.black);
    console.log();
  }

  for (;;) {
    console.log("Your turn.");
    choice = await question(orgChoice.question);

    if ( choice.match(/^r/i) ) {
      game = incrCSV(game, 'R');
      status = updatedStatus(game);
      console.log("GAME OVER\n\t%s\n", status.gameover);
      console.log(status.pgn);
      break;
    }

    if (nAMatch(choice) == null ||
      getOrgs(status.legalMoves).indexOf(choice) < 0) {
        console.log(orgChoice.defaultMessage);
        org = status.legalMoves.split(',')[0];
    } else {
      org = choice;
      console.log(
        orgChoice.confirmMessage,
        pieceNames[pieceOn(org, status.position)],
        org
      );
    }

    selMoves = status.legalMoves.split(',').filter(n => {
      return n.slice(0, 2) === org;
    }).map(n => {
      return n.slice(2);
    });

    plot(status.position, org, selMoves);

    choice = await question(destChoice.question);

    if (nAMatch(choice) == null || selMoves.indexOf(choice) < 0) {
      console.log(destChoice.defaultMessage);
      tsq = selMoves[0];
    } else {
      console.log(destChoice.confirmMessage, choice);
      tsq = choice;
    }

    if (pieceOn(org, status.position) === 'P' && tsq[1] == 8 ||
    pieceOn(org, status.position) === 'p' && tsq[1] == 1) {
      console.log("Pawn was automatically promoted to queen.");
      pro = 'q';
    } else {
      pro = '';
    }

    game = incrCSV(game, org + tsq + pro);
    status = updatedStatus(game);
    plot(status.position);

    if (status.gameover.length === 0) {
      console.log( status.movetext );
    }

    console.log( status.capturedList );
    console.log("White: %s", status.white);
    console.log("Black: %s", status.black);
    console.log();

    if (status.gameover.length > 0) {
      console.log("GAME OVER\n\t%s", status.gameover);
      console.log(status.pgn);
      break;
    }

    choice = cpuPlay(status.legalMoves);
    org = choice.slice(0, 2);
    tsq = choice.slice(2);

    if (pieceOn(org, status.position) === 'P' && tsq[1] == 8 ||
    pieceOn(org, status.position) === 'p' && tsq[1] == 1) {
      pro = 'q';
    } else {
      pro = '';
    }

    game = incrCSV( game, org + tsq + pro );
    status = updatedStatus(game);
    console.log(
      await new Promise(resolve => {
        return setTimeout( () => resolve("Computer moved:"), 3000 );
      })
      /* This gives the illusion of the computer taking a few seconds to decide
      on a move (it takes less than a second to process the computer's ply).
      This delay is also to help the user keep up with the otherwise fast
      scrolling-by of updated chessboards comprised of many lines of text to
      visually scan. */
    );
    plot(status.position);

    if (status.gameover.length === 0) {
      console.log( status.movetext );
    }

    console.log( status.capturedList );
    console.log("White: %s", status.white);
    console.log("Black: %s", status.black);
    console.log();

    if (status.gameover.length > 0) {
      console.log("GAME OVER\n\t%s", status.gameover);
      console.log(status.pgn);
      break;
    }
  }

  rl.close();
})();

/** Render a text chess board to console. Origin squares marked with "o" and target squares marked with an "X".
 * @param {Array} [position] chess position in Forsyth-Edwards Notation (FEN) with at least the piece placement data (PPD) field
 * @param {(string|Array)} [origins] a single origin square string in alebraic notation or array of such.
 * @param {Array} [targets] the targetSquares from "rays and nearest not on rays" listing function.
 */
function plot(position, origins, targets) {
  const an64 = Object.freeze(
    Array.from(
      {length: 64},
      (v, i) => "abcdefgh"[i % 8] + "87654321"[(i - i % 8) / 8]
    )
    // List of all algebraic notation in the same order as FEN piece
    // placement data: file-left-to-right, then descend one rank.
  );
  const ppd64 = expand(position.split(' ')[0], true);
  const idsOfTS = targets?.flat().map( s =>  an64.indexOf(s) );
  const spacedFiles = Array.from('abcdefgh').join('  ');
  let idsOfOrgs;

  if ( Array.isArray(origins) ) {
    idsOfOrgs = origins.map( s =>  an64.indexOf(s) );
  } else { // a single origin alg. notation string was entered
    idsOfOrgs = [ origins ].map( s => an64.indexOf(s) );
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
