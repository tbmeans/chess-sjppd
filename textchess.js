import readline from 'readline';

import util from 'util';

import ChessPosition from './movegen.js';

import ChessGame from './game.js';

import ChessMove from './movedata.js';

import cpuPlay from './engine.js';

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
  "Defaulting to the highest rank & left-most file piece with a move. " +
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
  confirmMessage: "You selected to move to %s. Result of ply:"
};

(async function gameLoop() {
  let choice = await question(sideChoice.question);
  let wbMatch = choice.match(/^w|b/i);
  let selectedBlack;
  let uWhite = 'user';
  let uBlack = 'cpu';
  let game;
  let allMoves;
  let nAMatch = s => s.match(/^[a-h][1-8]/);
  let org = { ppdIdx: 52, nA: "e2", nFE: "P" };
  let selMoves;
  let dest = { ppdIdx: 36, nA: "e4", nFE: "1" };

  if (wbMatch == null) {
    console.log(sideChoice.defaultMessage);
    selectedBlack = false;
  } else {
    selectedBlack = wbMatch[0].toLowerCase() === 'b';
  }

  if (selectedBlack) {
    uWhite = 'cpu';
    uBlack = 'user';
  }

  console.log(
    sideChoice.confirmMessage,
    selectedBlack ? 'Black' : 'White'
  );

  game = new ChessGame(new ChessPosition(), uWhite, uBlack);
  game.initPosition.sjppdGraph('.'.repeat(64), game.initPosition.ppd);
  allMoves = JSON.parse(game.initPosition.allMovesStr);

  if (uWhite === 'cpu') {
    allMoves = runEngine(game);
  }

  for (;;) {
    console.log("Your turn.");
    choice = await question(orgChoice.question);

    if (nAMatch(choice) == null ||
    game.curPosition.movesByAN.get(choice).length === 0) {
      console.log(orgChoice.defaultMessage);
      org.ppdIdx = allMoves.map(o => o.length > 0).indexOf(true);
      org.nA = game.curPosition.toAN(org.ppdIdx);
      org.nFE = game.curPosition.ppd[org.ppdIdx];
    } else {
      org.ppdIdx = game.curPosition.toPpdIdx(choice);
      org.nA = choice;
      org.nFE = game.curPosition.ppd[org.ppdIdx];
      console.log(orgChoice.confirmMessage, pieceNames[org.nFE], org.nA);
    }

    selMoves = allMoves[org.ppdIdx];
    game.curPosition.graphLegalMoves(org.ppdIdx);
    choice = await question(destChoice.question);

    if (nAMatch(choice) == null || selMoves.indexOf(choice) < 0) {
      console.log(destChoice.defaultMessage);
      dest.ppdIdx = game.curPosition.toPpdIdx(selMoves[0]);
      dest.nA = selMoves[0];
      dest.nFE = game.curPosition.ppd[org.ppdIdx];
    } else {
      console.log(orgChoice.confirmMessage, choice);
      dest.ppdIdx = game.curPosition.toPpdIdx(choice);
      dest.nA = choice;
      dest.nFE = game.curPosition.ppd[org.ppdIdx];
    }

    allMoves = makeMove(false, game, org, dest, "Q");

    if (game.endName.length > 0) {
      console.log("GAME OVER: %s", game.endName);
      // display pgn option here
      break;
    }

    allMoves = makeMove( true, game, ...cpuPlay(game.curPosition) );

    if (game.endName.length > 0) {
      console.log("GAME OVER: %s", game.endName);
      // display pgn option here
      break;
    }
  }

  rl.close();

  function makeMove(usingEngine, game, ...moveParams) {
    game.curMove = new ChessMove(...moveParams);

    if (usingEngine) {
      console.log("Computer moved:");
    } else {
      console.log("Result of your move:");
    }

    game.curPosition.sjpdGraph('.'.repeat(64), game.curPosition.ppd);
    // option here: display if in check, also maybe list movetext token
    // for black it'll be #... token
    return JSON.parse(game.curPosition.allMovesStr);
  }
})();
