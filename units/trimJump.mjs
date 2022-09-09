import assert from 'assert/strict'
import { captureRejectionSymbol } from 'events'

import engine from '../engine.js'

const {
  expand, jumpCircleAround, ppdSubset, trimToJumpEvent
} = engine.units

const squares = jumpCircleAround('e4');

const ppdAttackOnWhiteAllSides = "4r3/1b6/3n1n2/2nP1pn1/r3K2r/2n2qn1/2bnBn2/4q3";
const ppdEnemyFlip1 = "4R3/1B6/3N1N2/2NP1PN1/R3K2R/2N2QN1/2BNPN2/4Q3";
const boardAttackOnWhite = expand(ppdAttackOnWhiteAllSides);
const boardFlip1 = expand(ppdEnemyFlip1);
const piecesAttackOnWhite = ppdSubset(boardAttackOnWhite, squares);
const piecesFlip1 = ppdSubset(boardFlip1, squares);
const attackOnWhiteEvents = [ 'n', 'n', 'n', 'n', 'n', 'n', 'n', 'n' ];

const noEvents = ( new Array(8) ).fill('');

const ppdAttackOnBlackAllSides = "4R3/1B6/3N1N2/2Np2N1/R3k2R/2NP1QN1/2BNbN2/4Q3";
const ppdEnemyFlip2 = "4r3/1b6/3n1n2/2nP2n1/r3k2r/2np1qn1/2bnBn2/4q3";
const boardAttackOnBlack = expand(ppdAttackOnBlackAllSides);
const boardFlip2 = expand(ppdEnemyFlip2);
const piecesAttackOnBlack = ppdSubset(boardAttackOnBlack, squares);
const piecesFlip2 = ppdSubset(boardFlip2, squares);
const attackOnBlackEvents = attackOnWhiteEvents.map( ch => ch.toUpperCase() );

const listJumpEv = {
  whiteKingSurroundedByBlackKnightsListsCheckAllAround() {
    assertWithErrHandling(piecesAttackOnWhite, 'n', attackOnWhiteEvents);
  },
  whiteKingSurroundedByWhiteKnightsLists8EmptyStrings() {
    assertWithErrHandling(piecesFlip1, 'n', noEvents);
  },
  blackKingSurroundedByWhiteKnightsListsCheckAllAround() {
    assertWithErrHandling(piecesAttackOnBlack, 'N', attackOnBlackEvents);
  },
  blackKingSurroundedByBlackKnightsLists8EmptyStrings() {
    assertWithErrHandling(piecesFlip2, 'N', noEvents);
  }
};

export default listJumpEv;

function assertWithErrHandling(input1, input2, expected) {
  const actual = trimToJumpEvent(input1, input2);

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

