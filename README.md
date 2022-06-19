# Chess engine and legal move generator

## Intro
The progression of a chess game is represented by an object containing a sequence of moves and an initial position expressed as the first four fields of Forsyth-Edwards notation (FEN). A rudimentary chess engine is provided for play vs the computer.

## Representation of chess move
A game object expects the items in its sequence of moves to be objects as defined in the "movedata" module. To make a move data object, constructor params are algebraic notation of move origin and move destination, a single-char string in FEN representing the piece on each origin and destination, and an index number from 0 to 64 for the square, an alternative to algebraic notation. Square index 0 is top left, 64 is bottom right, advance file and descend rank. Methods are provided to derive useful information from the params supplied to the constructor.

## Representation of chess positions
The module "movegen" defines an object based on a FEN string and provides methods to transform the position in FEN given move data and generate all legal moves for a given position. To facilitate legal move generation, the piece placement data (PPD) of FEN is expanded into a 64-char string to represent all squares of the board, and a complimentary 64-char string is created to mark the squares of move origin and all legal move destinations. This complimentary string is referred to in this code as "slide and jump placement data," (sjpd).

## Progressing play
Use the "current move" setter of the game instance to add the next move data item to the game's sequence.
