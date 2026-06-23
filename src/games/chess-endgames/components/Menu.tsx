import { PUZZLES } from '../config'
import { useChessStore } from '../state/store'

// Puzzle-select screen: a card per endgame with its best star rating.
export function Menu() {
  const stars = useChessStore((s) => s.stars)
  const openPuzzle = useChessStore((s) => s.openPuzzle)

  const solved = PUZZLES.filter((p) => (stars[p.id] ?? 0) > 0).length

  return (
    <div className="ce-menu">
      <div className="ce-menu-inner">
        <h1 className="ce-menu-title">♟ CHESS ENDGAMES</h1>
        <p className="ce-menu-sub">
          You play White and move first. Solved {solved}/{PUZZLES.length}.
        </p>
        <div className="ce-puzzle-list">
          {PUZZLES.map((p, i) => {
            const st = stars[p.id] ?? 0
            return (
              <button key={p.id} className="ce-puzzle" onClick={() => openPuzzle(i)}>
                <span className="ce-puzzle-num">{p.id}</span>
                <span className="ce-puzzle-body">
                  <span className="ce-puzzle-name">{p.title}</span>
                  <span className="ce-puzzle-goal">
                    {p.goal === 'mate' ? `Mate in ${p.par}` : 'Find the winning move'}
                  </span>
                </span>
                <span className="ce-puzzle-stars">
                  {[1, 2, 3].map((n) => (
                    <span key={n} className={`ce-mini-star ${n <= st ? 'on' : ''}`}>
                      ★
                    </span>
                  ))}
                </span>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
