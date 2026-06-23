// ---------------------------------------------------------------------------
// Minimal, self-contained chess engine for the Endgames puzzle game.
// Board is an array[64]; index = rank * 8 + file, with rank 0 == rank "1" and
// file 0 == file "a". Pieces are letters (uppercase = White, lowercase = Black),
// '.' is empty. Enough rules for endgame puzzles: all piece moves, promotion,
// check / checkmate / stalemate. (No castling or en-passant — not needed here.)
// ---------------------------------------------------------------------------

export type Board = string[]
export interface Move {
  from: number
  to: number
  promo?: string // promotion piece letter, side-cased (e.g. 'Q' or 'q')
}

const FILES = 'abcdefgh'

export const isWhitePiece = (p: string) => p !== '.' && p === p.toUpperCase()
export const isBlackPiece = (p: string) => p !== '.' && p === p.toLowerCase()
const onBoard = (f: number, r: number) => f >= 0 && f < 8 && r >= 0 && r < 8

const N_OFF = [
  [1, 2], [2, 1], [2, -1], [1, -2], [-1, -2], [-2, -1], [-2, 1], [-1, 2],
]
const K_OFF = [
  [1, 0], [1, 1], [0, 1], [-1, 1], [-1, 0], [-1, -1], [0, -1], [1, -1],
]
const B_DIR = [[1, 1], [1, -1], [-1, 1], [-1, -1]]
const R_DIR = [[1, 0], [-1, 0], [0, 1], [0, -1]]

export function parseFEN(fen: string): { board: Board; whiteToMove: boolean } {
  const [placement, turn] = fen.split(' ')
  const board: Board = new Array(64).fill('.')
  const rows = placement.split('/') // rows[0] is rank 8
  for (let r = 0; r < 8; r++) {
    let file = 0
    for (const ch of rows[r]) {
      if (/\d/.test(ch)) file += +ch
      else {
        const rank = 7 - r
        board[rank * 8 + file] = ch
        file++
      }
    }
  }
  return { board, whiteToMove: turn !== 'b' }
}

export const sqName = (i: number) => FILES[i % 8] + (Math.floor(i / 8) + 1)
export const fileOf = (i: number) => i % 8
export const rankOf = (i: number) => Math.floor(i / 8)
export const moveUci = (m: Move) => sqName(m.from) + sqName(m.to) + (m.promo ? m.promo.toLowerCase() : '')

// Is square (f, r) attacked by the given side?
export function attacked(board: Board, f: number, r: number, byWhite: boolean): boolean {
  const pawnRank = byWhite ? -1 : 1 // attacking pawn sits one rank toward its side
  for (const df of [-1, 1]) {
    const af = f + df
    const ar = r + pawnRank
    if (onBoard(af, ar) && board[ar * 8 + af] === (byWhite ? 'P' : 'p')) return true
  }
  for (const [df, dr] of N_OFF) {
    const af = f + df
    const ar = r + dr
    if (onBoard(af, ar) && board[ar * 8 + af] === (byWhite ? 'N' : 'n')) return true
  }
  for (const [df, dr] of K_OFF) {
    const af = f + df
    const ar = r + dr
    if (onBoard(af, ar) && board[ar * 8 + af] === (byWhite ? 'K' : 'k')) return true
  }
  for (const [df, dr] of B_DIR) {
    let af = f + df
    let ar = r + dr
    while (onBoard(af, ar)) {
      const p = board[ar * 8 + af]
      if (p !== '.') {
        if (byWhite ? p === 'B' || p === 'Q' : p === 'b' || p === 'q') return true
        break
      }
      af += df
      ar += dr
    }
  }
  for (const [df, dr] of R_DIR) {
    let af = f + df
    let ar = r + dr
    while (onBoard(af, ar)) {
      const p = board[ar * 8 + af]
      if (p !== '.') {
        if (byWhite ? p === 'R' || p === 'Q' : p === 'r' || p === 'q') return true
        break
      }
      af += df
      ar += dr
    }
  }
  return false
}

export function kingSquare(board: Board, white: boolean): number {
  const k = white ? 'K' : 'k'
  for (let i = 0; i < 64; i++) if (board[i] === k) return i
  return -1
}

export function inCheck(board: Board, white: boolean): boolean {
  const ks = kingSquare(board, white)
  if (ks < 0) return false
  return attacked(board, fileOf(ks), rankOf(ks), !white)
}

export function makeMove(board: Board, m: Move): Board {
  const nb = board.slice()
  nb[m.to] = m.promo ? m.promo : nb[m.from]
  nb[m.from] = '.'
  return nb
}

// Pseudo-legal moves for the side to move (king-safety filtered separately).
function pseudoMoves(board: Board, white: boolean): Move[] {
  const moves: Move[] = []
  const own = white ? isWhitePiece : isBlackPiece
  for (let i = 0; i < 64; i++) {
    const p = board[i]
    if (p === '.' || !own(p)) continue
    const f = fileOf(i)
    const r = rankOf(i)
    const up = p.toUpperCase()
    if (up === 'P') {
      const dr = white ? 1 : -1
      const start = white ? 1 : 6
      const promoRank = white ? 7 : 0
      const one = r + dr
      if (onBoard(f, one) && board[one * 8 + f] === '.') {
        pushPawn(moves, i, one * 8 + f, one === promoRank, white)
        const two = r + 2 * dr
        if (r === start && board[two * 8 + f] === '.') moves.push({ from: i, to: two * 8 + f })
      }
      for (const df of [-1, 1]) {
        const cf = f + df
        const cr = r + dr
        if (onBoard(cf, cr)) {
          const t = board[cr * 8 + cf]
          if (t !== '.' && !own(t)) pushPawn(moves, i, cr * 8 + cf, cr === promoRank, white)
        }
      }
    } else if (up === 'N') {
      for (const [df, dr] of N_OFF) {
        const cf = f + df
        const cr = r + dr
        if (onBoard(cf, cr)) {
          const t = board[cr * 8 + cf]
          if (t === '.' || !own(t)) moves.push({ from: i, to: cr * 8 + cf })
        }
      }
    } else if (up === 'K') {
      for (const [df, dr] of K_OFF) {
        const cf = f + df
        const cr = r + dr
        if (onBoard(cf, cr)) {
          const t = board[cr * 8 + cf]
          if (t === '.' || !own(t)) moves.push({ from: i, to: cr * 8 + cf })
        }
      }
    } else {
      const dirs = up === 'B' ? B_DIR : up === 'R' ? R_DIR : [...B_DIR, ...R_DIR]
      for (const [df, dr] of dirs) {
        let cf = f + df
        let cr = r + dr
        while (onBoard(cf, cr)) {
          const t = board[cr * 8 + cf]
          if (t === '.') moves.push({ from: i, to: cr * 8 + cf })
          else {
            if (!own(t)) moves.push({ from: i, to: cr * 8 + cf })
            break
          }
          cf += df
          cr += dr
        }
      }
    }
  }
  return moves
}

function pushPawn(moves: Move[], from: number, to: number, promo: boolean, white: boolean) {
  if (promo) for (const pp of ['Q', 'R', 'B', 'N']) moves.push({ from, to, promo: white ? pp : pp.toLowerCase() })
  else moves.push({ from, to })
}

export function legalMoves(board: Board, white: boolean): Move[] {
  return pseudoMoves(board, white).filter((m) => !inCheck(makeMove(board, m), white))
}

export function legalMovesFrom(board: Board, white: boolean, from: number): Move[] {
  return legalMoves(board, white).filter((m) => m.from === from)
}

export function isCheckmate(board: Board, white: boolean): boolean {
  return inCheck(board, white) && legalMoves(board, white).length === 0
}
export function isStalemate(board: Board, white: boolean): boolean {
  return !inCheck(board, white) && legalMoves(board, white).length === 0
}

// --- tiny defensive AI (used for Black in mate puzzles) ---------------------
const VAL: Record<string, number> = { P: 1, N: 3, B: 3, R: 5, Q: 9, K: 0 }
const MATE = 100000

function evaluate(board: Board, white: boolean): number {
  let s = 0
  for (const p of board) {
    if (p === '.') continue
    const v = VAL[p.toUpperCase()]
    s += isWhitePiece(p) ? v : -v
  }
  return (white ? s : -s) * 100
}

function negamax(board: Board, white: boolean, depth: number, alpha: number, beta: number): number {
  const legal = legalMoves(board, white)
  if (legal.length === 0) return inCheck(board, white) ? -MATE - depth : 0
  if (depth === 0) return evaluate(board, white)
  legal.sort((a, b) => (board[b.to] !== '.' ? 1 : 0) - (board[a.to] !== '.' ? 1 : 0))
  let best = -Infinity
  for (const m of legal) {
    const sc = -negamax(makeMove(board, m), !white, depth - 1, -beta, -alpha)
    if (sc > best) best = sc
    if (best > alpha) alpha = best
    if (alpha >= beta) break
  }
  return best
}

// Best reply for the side to move; depth small (endgames have few pieces).
export function chooseMove(board: Board, white: boolean, depth = 3): Move | null {
  const legal = legalMoves(board, white)
  if (legal.length === 0) return null
  legal.sort((a, b) => (board[b.to] !== '.' ? 1 : 0) - (board[a.to] !== '.' ? 1 : 0))
  let best = -Infinity
  let bm: Move | null = null
  for (const m of legal) {
    const sc = -negamax(makeMove(board, m), !white, depth - 1, -Infinity, Infinity)
    if (sc > best) {
      best = sc
      bm = m
    }
  }
  return bm
}
