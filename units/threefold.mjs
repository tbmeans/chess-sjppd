import assert from 'assert/strict'
import { captureRejectionSymbol } from 'events'

import engine from '../engine.js'

const { is3foldRep } = engine.units

const init3Reps = [
  "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0",
  "rnbqkbnr/pppppppp/8/8/8/7N/PPPPPPPP/RNBQKB1R b KQkq - 1",
  "rnbqkb1r/pppppppp/7n/8/8/7N/PPPPPPPP/RNBQKB1R w KQkq - 2",
  "rnbqkb1r/pppppppp/7n/8/8/8/PPPPPPPP/RNBQKBNR b KQkq - 3",
  "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 4",
  "rnbqkbnr/pppppppp/8/8/8/7N/PPPPPPPP/RNBQKB1R b KQkq - 5",
  "rnbqkb1r/pppppppp/7n/8/8/7N/PPPPPPPP/RNBQKB1R w KQkq - 6",
  "rnbqkb1r/pppppppp/7n/8/8/8/PPPPPPPP/RNBQKBNR b KQkq - 7",
  "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 8"
].join(',');

const report3 = {
  movingKnightsBackAndForthFromInitRegisters3FoldRepetition() {
    assertWithErrHandling(init3Reps, true);
  }
};

export default report3;

function assertWithErrHandling(positions, expected) {
  const actual = is3foldRep(positions);

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
