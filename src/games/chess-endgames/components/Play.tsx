import { useEffect, useRef } from 'react'
import { PUZZLES } from '../config'
import { useChessStore } from '../state/store'
import { Board } from './Board'

// Group ply-ordered SAN into numbered full moves: "1. Bf3+ Kg1".
function MoveList({ history }: { history: string[] }) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const el = ref.current
    if (el) el.scrollLeft = el.scrollWidth
  }, [history])

  const moves = []
  for (let i = 0; i < history.length; i += 2) {
    moves.push(
      <span key={i} className="ce-move">
        <span className="ce-move-no">{i / 2 + 1}.</span>
        <span className="ce-san">{history[i]}</span>
        {history[i + 1] && <span className="ce-san black">{history[i + 1]}</span>}
      </span>,
    )
  }

  return (
    <div className="ce-movelist" ref={ref}>
      {history.length === 0 ? <span className="ce-move-empty">Moves appear here…</span> : moves}
    </div>
  )
}

// The play view: board, status bar, controls and the solved overlay.
export function Play() {
  const puzzleIndex = useChessStore((s) => s.puzzleIndex)
  const status = useChessStore((s) => s.status)
  const message = useChessStore((s) => s.message)
  const movesUsed = useChessStore((s) => s.movesUsed)
  const earnedStars = useChessStore((s) => s.earnedStars)
  const useHint = useChessStore((s) => s.useHint)
  const restartPuzzle = useChessStore((s) => s.restartPuzzle)
  const toMenu = useChessStore((s) => s.toMenu)
  const nextPuzzle = useChessStore((s) => s.nextPuzzle)

  const sanHistory = useChessStore((s) => s.sanHistory)
  const p = PUZZLES[puzzleIndex]
  const isLast = puzzleIndex >= PUZZLES.length - 1

  return (
    <div className="ce-play">
      <div className="ce-topbar">
        <button className="ce-chip" onClick={toMenu}>
          ‹ Puzzles
        </button>
        <div className="ce-topinfo">
          <span className="ce-puzzle-title">
            #{p.id} · {p.title}
          </span>
          <span className="ce-prompt">
            {status === 'engine'
              ? 'Black is thinking…'
              : p.goal === 'mate'
                ? `White to move · Mate in ${p.par}`
                : p.goal === 'convert'
                  ? 'White to move · Win, then checkmate'
                  : 'White to move · Find the win'}
          </span>
        </div>
        <div className="ce-moves">{p.goal === 'convert' ? movesUsed : `${movesUsed}/${p.par}`}</div>
      </div>

      <div className="ce-board-wrap">
        <Board />
        {message && <div className="ce-toast">{message}</div>}
      </div>

      <MoveList history={sanHistory} />

      <div className="ce-controls">
        <button className="ce-btn ce-btn-ghost" onClick={useHint} disabled={status !== 'player'}>
          💡 Hint
        </button>
        <button className="ce-btn ce-btn-ghost" onClick={restartPuzzle}>
          ↺ Reset
        </button>
      </div>

      {status === 'solved' && (
        <div className="ce-overlay">
          <div className="ce-panel">
            <h1 className="ce-title win">✓ SOLVED!</h1>
            <div className="ce-stars">
              {[1, 2, 3].map((n) => (
                <span key={n} className={`ce-star ${n <= earnedStars ? 'on' : ''}`}>
                  ★
                </span>
              ))}
            </div>
            <p className="ce-idea">{p.idea}</p>
            <div className="ce-btn-row">
              {!isLast && (
                <button className="ce-btn" onClick={nextPuzzle}>
                  NEXT ▶
                </button>
              )}
              <button className="ce-btn ce-btn-2" onClick={restartPuzzle}>
                ⟳ REPLAY
              </button>
              <button className="ce-btn ce-btn-2" onClick={toMenu}>
                ☰ PUZZLES
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
