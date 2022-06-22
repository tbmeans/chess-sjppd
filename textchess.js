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
  confirmChoiceMessage: "You are playing as %s"
};

const orgChoice = {
  question: 'Enter algebraic notation of the square ' +
  'that the piece you want to move is on. ',
  defaultMessage: "You selected a square with no piece, " +
  "a square on which is a piece with no moves, " +
  "or did not enter valid algebraic notation. " +
  "Defaulting to the highest rank & left-most file piece with a move.",
  confirmChoiceMessage: "You selected the %s on %s. Here are its moves:"
};

let uWhite = 'user';

let uBlack = 'cpu';

let game;

gameLoop();

async function gameLoop() {
  let choice = await question(sideChoice.question);
  let wbMatch = choice.match(/^w|b/i);
  let selectedBlack, game;

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
    sideChoice.confirmChoiceMessage,
    selectedBlack ? 'Black' : 'White'
  );

  game = new ChessGame(new ChessPosition(), uWhite, uBlack);
  game.initPosition.sjpdGraph('.'.repeat(64), game.initPosition.ppd);

  if (uWhite === 'cpu') {
    game.curMove = new ChessMove( ...cpuPlay(game.curPosition) );
    console.log("Computer moved:");
    game.curPosition.sjpdGraph('.'.repeat(64), game.curPosition.ppd);
  }

  let loopCount = 0;

  while (loopCount < 3) {
    choice = await question(orgChoice.question);
    console.log(choice);
    loopCount++;
  }

  rl.close();
}
