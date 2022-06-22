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

let uWhite = 'user';

let uBlack = 'cpu';

let game;

startGame();

async function startGame() {
  const answer = await question(sideChoice.question);
  const wbMatch = answer.match(/^w|b/i);
  let selectedBlack;

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

  rl.close();

  game.initPosition.sjpdGraph('.'.repeat(64), game.initPosition.ppd);
}
