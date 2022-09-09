import assert from 'assert/strict'
import { captureRejectionSymbol } from 'events'

import engine from '../engine.js'

const { getSequenceOfCaptures } = engine.units

const listCaps = {
  twelveHalfmovesOfEvergreenGameAccumulated2WhitePawnsCaptured() {
    assertWithErrHandling(
      [ "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0",
        "rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0",
        "rnbqkbnr/pppp1ppp/8/4p3/4P3/8/PPPP1PPP/RNBQKBNR w KQkq e6 0",
        "rnbqkbnr/pppp1ppp/8/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R b KQkq - 1",
        "r1bqkbnr/pppp1ppp/2n5/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq - 2",
        "r1bqkbnr/pppp1ppp/2n5/4p3/2B1P3/5N2/PPPP1PPP/RNBQK2R b KQkq - 3",
        "r1bqk1nr/pppp1ppp/2n5/2b1p3/2B1P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 4",
        "r1bqk1nr/pppp1ppp/2n5/2b1p3/1PB1P3/5N2/P1PP1PPP/RNBQK2R b KQkq b3 0",
        "r1bqk1nr/pppp1ppp/2n5/4p3/1bB1P3/5N2/P1PP1PPP/RNBQK2R w KQkq - 0",
        "r1bqk1nr/pppp1ppp/2n5/4p3/1bB1P3/2P2N2/P2P1PPP/RNBQK2R b KQkq - 0",
        "r1bqk1nr/pppp1ppp/2n5/b3p3/2B1P3/2P2N2/P2P1PPP/RNBQK2R w KQkq - 1",
        "r1bqk1nr/pppp1ppp/2n5/b3p3/2BPP3/2P2N2/P4PPP/RNBQK2R b KQkq d3 0",
        "r1bqk1nr/pppp1ppp/2n5/b7/2BpP3/2P2N2/P4PPP/RNBQK2R w KQkq - 0"
      ].join(','), 'PP'
    );
  }
};

export default listCaps;

function assertWithErrHandling(positionSeq, expected) {
  const actual = getSequenceOfCaptures(positionSeq);

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
