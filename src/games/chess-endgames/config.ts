// ---------------------------------------------------------------------------
// Chess Endgames — a campaign of bite-size endgame puzzles. You always play
// White and move first. Each puzzle is either:
//   - 'keymove': find the one winning idea (validated against accepted moves)
//   - 'mate':    deliver checkmate within `par` moves (Black defends via the
//                built-in engine; the board verifies the mate)
// All positions are engine-verified (see the analysis in the PR).
// ---------------------------------------------------------------------------

// 'keymove' = find the one winning move; 'mate' = mate within `par` moves;
// 'convert' = find the key move, then play on against the engine until you mate.
export type Goal = 'keymove' | 'mate' | 'convert'

export interface Puzzle {
  id: number
  title: string
  fen: string // White to move
  goal: Goal
  par: number // target number of White moves
  solution?: string[] // accepted UCI first moves for 'keymove'
  idea: string // shown on solve — the teaching point
  hintSquares?: [string, string] // [from, to] used by the Hint button
}

export const PUZZLES: Puzzle[] = [
  {
    id: 1,
    title: 'The Taboo Bishop',
    fen: '8/8/3p4/4p2B/4P3/8/4K1kp/8 w - - 0 1',
    goal: 'convert',
    par: 1,
    solution: ['h5f3'],
    hintSquares: ['h5', 'f3'],
    idea: 'Bf3+! was the key — it checks the king AND covers h1 to kill the …h1=Q threat, and the bishop is taboo because your king guards f3. From there you won the h-pawn a piece up and converted the win into checkmate. Clean technique!',
  },
]

// Strength of Black's defence (search depth) while you play the puzzle out.
export const ENGINE_DEPTH = 3
