import assert from 'assert/strict'
import { captureRejectionSymbol } from 'events'

import engine from '../engine.js'

const { disambiguationTable } = engine;

const listTbl = {
  successfulReproductionOfWikipediaAlgebraicNotationDisambiguationExample() {
    assertWithErrHandling(
      'a1a2,a1a3,a1a4,a1b1,a1c1,a1d1,a1e1,a1f1,a1g1' +
      ',' +
      'h1h2,h1h3,h1g1,h1f1,h1e1,h1d1,h1c1,h1b1,h1g2,h1f3' +
      ',' +
      'e4e5,e4e6,e4e7,e4e8,e4f5,e4g6,e4h7,e4f4,e4g4,e4f3,e4g2,e4e3,e4e2,' +
      'e4e1,e4d3,e4c2,e4b1,e4d4,e4c4,e4b4,e4a4,e4d5,e4c6,e4b7,e4a8' +
      ',' +
      'h4h5,h4h6,h4h7,h4h8,h4h3,h4h2,h4g3,h4f2,h4e1,h4g4,h4f4,h4g5,h4f6,' +
      'h4e7,h4d8' +
      ',' +
      'a5a6,a5a7,a5a8,a5b5,a5c5,a5d5,a5e5,a5f5,a5g5,a5h5,a5a4,a5a3,a5a2',

      'R111111Q11111111111111111111Q11QR11111111111111111111111111r111r',

      'h1h21,h1h31,h1e11,h1b1h,h1g2h,h1f3h,e4e7e,e4h7e,e4f4e,e4g4e,e4f3e,' +
      'e4g2e,e4e1e,e4b1e,h4h7h,h4h34,h4h24,h4e1h4,h4g4h,h4f4h,h4e7h,a1a21,' +
      'a1a31,a1a41,a5a45,a5a35,a5a25'
    );
  }
};

export default listTbl;

function assertWithErrHandling(allMoves, ppd64, expected) {
  const actual = disambiguationTable(allMoves, ppd64);

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
