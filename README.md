# Chess engine and legal move generator

## Intro
The progression of a chess game is represented by an object containing a sequence of moves and an initial position expressed as the first four fields of Forsyth-Edwards notation (FEN). A rudimentary chess engine is provided for play vs the computer.

## Progressing play
Use the sequence of moves setter, entering a move in [Pure coordinate notation](https://www.chessprogramming.org/Algebraic_Chess_Notation#Pure_coordinate_notation) then use the current game status getter and inspect the returned object for game continuation or game termination.
