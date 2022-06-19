export default function cpuPlay(position) {
  const board = JSON.parse(position.allMovesStr);
  const pickSquare = () => parseInt( 64 * Math.random() );
  const pickMove = len => parseInt( len * Math.random() );
  const orgData = { ppdIdx: 1, nA: "b8", nFE: "n" };
  const destData = { ppdIdx: 16, nA: "a8", nFE: "r" };
  let ppdIdxOfSelSq = -1;
  let moves, selectedMove;

  if ( board.every(o => o.length === 0) ) {
    return "cpu checkmated or stalemate";
  }

  while (board[ppdIdxOfSelSq] == undefined ||
  board[ppdIdxOfSelSq].length === 0) {
    ppdIdxOfSelSq = pickSquare();
  }

  moves = board[ppdIdxOfSelSq];
  selectedMove = moves[pickMove(moves.length)];

  orgData.ppdIdx = ppdIdxOfSelSq;
  orgData.nA = position.toAN(ppdIdxOfSelSq);
  orgData.nFE = position.ppd[ppdIdxOfSelSq];
  destData.ppdIdx = position.toPpdIdx(selectedMove);
  destData.nA = selectedMove;
  destData.nFE = position.ppd[destData.ppdIdx];

  return [ orgData, destData, "Q" ];
}
