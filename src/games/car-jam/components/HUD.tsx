import { DIFFICULTY_ORDER, LEVELS } from '../config'
import { useCarStore } from '../state/store'

// Car Jam 2D UI. All classes cj- prefixed so nothing clashes with other games.
export function HUD() {
  const phase = useCarStore((s) => s.phase)
  const difficulty = useCarStore((s) => s.difficulty)
  const carsLeft = useCarStore((s) => s.carsLeft)
  const taps = useCarStore((s) => s.taps)
  const budget = useCarStore((s) => s.budget)
  const paused = useCarStore((s) => s.paused)
  const result = useCarStore((s) => s.result)
  const score = useCarStore((s) => s.score)
  const stars = useCarStore((s) => s.stars)
  const highScores = useCarStore((s) => s.highScores)
  const isNewHigh = useCarStore((s) => s.isNewHigh)
  const start = useCarStore((s) => s.start)
  const restart = useCarStore((s) => s.restart)
  const toMenu = useCarStore((s) => s.toMenu)
  const togglePause = useCarStore((s) => s.togglePause)

  const tapsLeft = Math.max(0, budget - taps)

  return (
    <div className="cj-hud">
      {phase === 'playing' && (
        <>
          <div className="cj-stat cj-cars">
            <span className="cj-stat-ico">🚗</span>
            <span className="cj-stat-val">{carsLeft}</span>
            <span className="cj-stat-lbl">left</span>
          </div>
          <div className={`cj-stat cj-taps ${tapsLeft <= 2 ? 'low' : ''}`}>
            <span className="cj-stat-ico">👆</span>
            <span className="cj-stat-val">{tapsLeft}</span>
            <span className="cj-stat-lbl">taps</span>
          </div>
          <div className={`cj-badge cj-${difficulty}`}>{LEVELS[difficulty].label}</div>
          <button className="cj-pause" onClick={togglePause} aria-label="Pause">
            ❚❚
          </button>
        </>
      )}

      {paused && (
        <div className="cj-overlay">
          <div className="cj-panel">
            <h1 className="cj-title">PAUSED</h1>
            <div className="cj-btn-row">
              <button className="cj-btn" onClick={togglePause}>
                ▶ RESUME
              </button>
              <button className="cj-btn cj-btn-2" onClick={restart}>
                ↻ NEW LOT
              </button>
              <button className="cj-btn cj-btn-2" onClick={toMenu}>
                ☰ QUIT
              </button>
            </div>
          </div>
        </div>
      )}

      {phase === 'start' && (
        <div className="cj-overlay">
          <div className="cj-panel">
            <h1 className="cj-title">🚗 CAR JAM</h1>
            <p className="cj-sub">
              Tap a car to drive it off the lot in its arrow's direction.
              <br />
              It only leaves if the lane ahead is clear — <b>free the blockers first!</b>
            </p>
            <p className="cj-choose">CHOOSE DIFFICULTY</p>
            <div className="cj-diff-list">
              {DIFFICULTY_ORDER.map((id) => {
                const lvl = LEVELS[id]
                const best = highScores[id] ?? 0
                return (
                  <button key={id} className={`cj-diff cj-${id}`} onClick={() => start(id)}>
                    <span className="cj-diff-name">{lvl.label}</span>
                    <span className="cj-diff-tag">{lvl.blurb}</span>
                    {best > 0 && <span className="cj-diff-best">★ best {best}</span>}
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {(phase === 'win' || phase === 'lose') && (
        <div className="cj-overlay">
          <div className="cj-panel">
            <h1 className={`cj-title ${result === 'win' ? 'win' : 'lose'}`}>
              {result === 'win' ? '🏁 LOT CLEARED!' : '🚧 GRIDLOCKED'}
            </h1>
            {result === 'win' && (
              <div className="cj-stars">
                {[1, 2, 3].map((n) => (
                  <span key={n} className={`cj-star ${n <= stars ? 'on' : ''}`}>
                    ★
                  </span>
                ))}
              </div>
            )}
            <p className="cj-sub">
              {result === 'win' ? (
                <>
                  You untangled the <b>{LEVELS[difficulty].label}</b> lot with{' '}
                  <b>{Math.max(0, budget - taps)}</b> taps to spare!
                </>
              ) : (
                <>
                  Out of taps with cars still stuck.
                  <br />
                  Clear the blockers in the right order and retry.
                </>
              )}
            </p>
            <div className="cj-score">
              <div className="cj-score-row">
                <span>SCORE</span>
                <span className="cj-score-v">{score}</span>
              </div>
              <div className="cj-score-row best">
                <span>BEST</span>
                <span className="cj-score-v">{highScores[difficulty] ?? 0}</span>
              </div>
              {isNewHigh && <div className="cj-newhigh">🎉 NEW HIGH SCORE!</div>}
            </div>
            <div className="cj-btn-row">
              <button className="cj-btn" onClick={restart}>
                ⟳ PLAY AGAIN
              </button>
              <button className="cj-btn cj-btn-2" onClick={toMenu}>
                ☰ CHANGE LEVEL
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
