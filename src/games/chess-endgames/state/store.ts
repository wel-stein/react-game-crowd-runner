import { create } from 'zustand'
import { ENGINE_DEPTH, PUZZLES, type Puzzle } from '../config'
import {
  chooseMove,
  isCheckmate,
  isStalemate,
  legalMoves,
  legalMovesFrom,
  makeMove,
  moveUci,
  parseFEN,
  isWhitePiece,
  type Board,
  type Move,
} from '../engine'

export type Screen = 'menu' | 'play'
export type Status = 'player' | 'engine' | 'solved'

const STARS_KEY = 'chessendgames.stars.v1'
type StarMap = Record<number, number>

function loadStars(): StarMap {
  try {
    const raw = localStorage.getItem(STARS_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}
function saveStars(s: StarMap) {
  try {
    localStorage.setItem(STARS_KEY, JSON.stringify(s))
  } catch {
    /* ignore */
  }
}

interface State {
  screen: Screen
  puzzleIndex: number
  board: Board
  selected: number | null
  targets: number[]
  lastMove: [number, number] | null
  status: Status
  message: string | null // transient feedback
  movesUsed: number
  hintUsed: boolean
  retried: boolean
  earnedStars: number
  hintSquares: [number, number] | null // highlighted by the Hint button
  stars: StarMap

  openPuzzle: (index: number) => void
  toMenu: () => void
  clickSquare: (sq: number) => void
  useHint: () => void
  restartPuzzle: () => void
  nextPuzzle: () => void
}

const sqIndex = (name: string) => 'abcdefgh'.indexOf(name[0]) + (Number(name[1]) - 1) * 8

function load(puzzle: Puzzle) {
  const { board } = parseFEN(puzzle.fen)
  return board
}

export const useChessStore = create<State>((set, get) => {
  const puzzle = () => PUZZLES[get().puzzleIndex]

  const fail = (msg: string) => {
    // revert to the starting position and let the player retry
    const board = load(puzzle())
    set({
      board,
      selected: null,
      targets: [],
      lastMove: null,
      status: 'player',
      message: msg,
      movesUsed: 0,
      retried: true,
    })
    setTimeout(() => {
      if (get().message === msg) set({ message: null })
    }, 1800)
  }

  const solve = () => {
    const p = puzzle()
    const { hintUsed, retried, movesUsed, stars } = get()
    let s = 3
    if (hintUsed) s = Math.min(s, 2)
    if (retried) s = Math.min(s, 2)
    // a full conversion takes many moves, so don't penalise move count there
    if (p.goal !== 'convert' && movesUsed > p.par) s = Math.min(s, 2)
    if (hintUsed && retried) s = 1
    s = Math.max(1, s)
    const best = Math.max(stars[p.id] ?? 0, s)
    const nextStars = { ...stars, [p.id]: best }
    saveStars(nextStars)
    set({ status: 'solved', earnedStars: s, stars: nextStars, message: null, selected: null, targets: [] })
  }

  const engineReply = () => {
    set({ status: 'engine' })
    setTimeout(() => {
      const { board } = get()
      const reply = chooseMove(board, false, ENGINE_DEPTH)
      if (!reply) {
        // Black has no move — but it wasn't mate/stalemate when we checked; bail safe
        set({ status: 'player' })
        return
      }
      const nb = makeMove(board, reply)
      set({ board: nb, lastMove: [reply.from, reply.to], status: 'player' })
      if (isCheckmate(nb, true)) fail('Black mated you — try again!')
      else if (isStalemate(nb, true)) fail('Stalemate — only a draw. Try again.')
    }, 480)
  }

  const applyPlayerMove = (m: Move) => {
    const p = puzzle()
    const board = get().board
    const nb = makeMove(board, m)
    const movesUsed = get().movesUsed + 1
    set({ board: nb, lastMove: [m.from, m.to], selected: null, targets: [], movesUsed })

    if (p.goal === 'keymove') {
      if (p.solution?.includes(moveUci(m))) solve()
      else fail('Not the key move — look again.')
      return
    }

    // 'convert': the first move must be the key move, then play on to mate
    if (p.goal === 'convert' && movesUsed === 1 && p.solution && !p.solution.includes(moveUci(m))) {
      fail('Not the key move — look again.')
      return
    }

    // shared resolution for 'mate' and 'convert'
    if (isCheckmate(nb, false)) {
      solve()
      return
    }
    if (isStalemate(nb, false)) {
      fail('Stalemate! That only draws — try again.')
      return
    }
    if (p.goal === 'mate' && movesUsed >= p.par) {
      fail('Not the mate — try again.')
      return
    }
    engineReply()
  }

  return {
    screen: 'menu',
    puzzleIndex: 0,
    board: load(PUZZLES[0]),
    selected: null,
    targets: [],
    lastMove: null,
    status: 'player',
    message: null,
    movesUsed: 0,
    hintUsed: false,
    retried: false,
    earnedStars: 0,
    hintSquares: null,
    stars: loadStars(),

    openPuzzle: (index) => {
      set({
        screen: 'play',
        puzzleIndex: index,
        board: load(PUZZLES[index]),
        selected: null,
        targets: [],
        lastMove: null,
        status: 'player',
        message: null,
        movesUsed: 0,
        hintUsed: false,
        retried: false,
        earnedStars: 0,
        hintSquares: null,
      })
    },

    toMenu: () => set({ screen: 'menu', selected: null, targets: [], hintSquares: null }),

    clickSquare: (sq) => {
      const { status, board, selected, targets } = get()
      if (status !== 'player') return
      if (selected !== null && targets.includes(sq)) {
        const opts = legalMovesFrom(board, true, selected).filter((m) => m.to === sq)
        const move = opts.find((m) => m.promo === 'Q') ?? opts[0]
        if (move) applyPlayerMove(move)
        return
      }
      const piece = board[sq]
      if (piece !== '.' && isWhitePiece(piece)) {
        set({
          selected: sq,
          targets: legalMovesFrom(board, true, sq).map((m) => m.to),
          hintSquares: null,
        })
      } else {
        set({ selected: null, targets: [] })
      }
    },

    useHint: () => {
      const p = puzzle()
      if (!p.hintSquares) return
      const [a, b] = p.hintSquares
      set({ hintUsed: true, hintSquares: [sqIndex(a), sqIndex(b)], selected: null, targets: [] })
      setTimeout(() => {
        if (get().hintSquares) set({ hintSquares: null })
      }, 2200)
    },

    restartPuzzle: () => {
      set({
        board: load(puzzle()),
        selected: null,
        targets: [],
        lastMove: null,
        status: 'player',
        message: null,
        movesUsed: 0,
        hintSquares: null,
      })
    },

    nextPuzzle: () => {
      const next = get().puzzleIndex + 1
      if (next >= PUZZLES.length) {
        get().toMenu()
        return
      }
      get().openPuzzle(next)
    },
  }
})

// re-export for components that need quick legality checks
export { legalMoves }
