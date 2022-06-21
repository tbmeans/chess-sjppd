import readline from 'readline';

import ChessPosition from './movegen.js';

import ChessGame from './game.js';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const sideChoice = {
  question: 'Enter your choice of side to play, white or black. ',
  defaultMessage: "Invalid response. Defaulting you to playing white.",
  confirmChoiceMessage: "You are playing as %s"
};

let uWhite = 'user';

let uBlack = 'cpu';

let game;

rl.question(sideChoice.question, (answer) => {
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
});
