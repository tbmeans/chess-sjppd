# Chess engine and legal move generator

## Intro
Provides results of the user's choice of moves necessary to progress a chess game. A rudimentary chess engine is provided for play vs the computer.

## Progressing play
The accumulation of chess moves made by each side, expressed as a comma-separated list of [Pure coordinate notation (PCN)](https://www.chessprogramming.org/Algebraic_Chess_Notation#Pure_coordinate_notation) strings, and a template object for game data export in [Portable Game Notation (PGN)](https://ia802908.us.archive.org/26/items/pgn-standard-1994-03-12/PGN_standard_1994-03-12.txt) are to be entered into the "getGameStatus" function to produce the following information used to update a chess game user interface: position in Forsyth-Edwards notation (FEN), list of legal moves in PCN, who has the move, the scoresheet list of moves in standard algebraic notation, a list of captured pieces, and if the game is over, cause of game over and the filled-in PGN.
