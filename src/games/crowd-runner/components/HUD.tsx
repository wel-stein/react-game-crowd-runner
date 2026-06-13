import { useEffect, useRef, useState } from 'react'
import { DIFFICULTY_ORDER, LEVELS } from '../config'
import { useGameStore } from '../state/store'

// All 2D UI: crowd counter, progress bar, and the start / pause / win / lose
// overlays. Rendered as plain DOM on top of the canvas.
export function HUD() {
  const phase = useGameStore((s) => s.phase)
  const crowd = useGameStore((s) => s.crowd)
  const popKey = useGameStore((s) => s.popKey)
  const progress = useGameStore((s) => s.progress)
  const result = useGameStore((s) => s.result)
  const finalCrowd = useGameStore((s) => s.finalCrowd)
  const difficulty = useGameStore((s) => s.difficulty)
  const clashCrowd = useGameStore((s) => s.clashCrowd)
  const bossMax = useGameStore((s) => s.bossMax)
  const paused = useGameStore((s) => s.paused)
  const score = useGameStore((s) => s.score)
  const stars = useGameStore((s) => s.stars)
  const highScores = useGameStore((s) => s.highScores)
  const isNewHigh = useGameStore((s) => s.isNewHigh)
  const start = useGameStore((s) => s.start)
  const restart = useGameStore((s) => s.restart)
  const toMenu = useGameStore((s) => s.toMenu)
  const togglePause = useGameStore((s) => s.togglePause)

  // re-trigger the pop animation whenever the count changes
  const [pop, setPop] = useState(false)
  const first = useRef(true)
  useEffect(() => {
    if (first.current) {
      first.current = false
      return
    }
    setPop(true)
    const t = setTimeout(() => setPop(false), 220)
    return () => clearTimeout(t)
  }, [popKey])

  const showCounter = phase === 'playing' || phase === 'battle'

  return (
    <div className="hud">
      {showCounter && (
        <>
          <div className={`crowd-counter ${pop ? 'pop' : ''}`}>
            <span className="people-icon">🏃</span>
            {crowd}
          </div>
          <div className="progress-wrap">
            <div className="progress-track">
              <div className="progress-fill" style={{ width: `${progress * 100}%` }} />
              <div className="progress-flag" style={{ left: `calc(${progress * 100}% - 10px)` }}>
                🚩
              </div>
            </div>
            <div className="progress-label">BOSS</div>
          </div>
          <div className={`difficulty-badge diff-${difficulty}`}>{LEVELS[difficulty].label}</div>
          {phase === 'playing' && (
            <button className="pause-btn" onClick={togglePause} aria-label="Pause">
              ❚❚
            </button>
          )}
        </>
      )}

      {phase === 'battle' && (
        <div className="showdown">
          <span className="showdown-side you">{clashCrowd}</span>
          <span className="showdown-vs">VS</span>
          <span className="showdown-side boss">{bossMax}</span>
        </div>
      )}

      {paused && (
        <div className="overlay">
          <div className="panel">
            <h1 className="title">PAUSED</h1>
            <div className="btn-row">
              <button className="btn" onClick={togglePause}>
                ▶ RESUME
              </button>
              <button className="btn btn-secondary" onClick={toMenu}>
                ☰ QUIT
              </button>
            </div>
          </div>
        </div>
      )}

      {phase === 'start' && (
        <div className="overlay">
          <div className="panel">
            <h1 className="title">CROWD RUNNER</h1>
            <p className="subtitle">
              Drag or use <b>← →</b> / <b>A&nbsp;D</b> to steer your crowd.
              <br />
              Pick the best gates, grow your army, crush the boss!
            </p>
            <p className="choose-label">CHOOSE DIFFICULTY</p>
            <div className="diff-list">
              {DIFFICULTY_ORDER.map((id) => {
                const lvl = LEVELS[id]
                const best = highScores[id] ?? 0
                return (
                  <button key={id} className={`diff-btn diff-${id}`} onClick={() => start(id)}>
                    <span className="diff-name">{lvl.label}</span>
                    <span className="diff-blurb">{lvl.blurb}</span>
                    <span className="diff-boss">👹 {lvl.bossHealth}</span>
                    {best > 0 && <span className="diff-best">★ best {best}</span>}
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {(phase === 'win' || phase === 'lose') && (
        <div className="overlay">
          <div className="panel">
            <h1 className={`title ${result === 'win' ? 'win' : 'lose'}`}>
              {result === 'win' ? '🏆 VICTORY!' : '💀 DEFEATED'}
            </h1>

            {result === 'win' && (
              <div className="stars">
                {[1, 2, 3].map((n) => (
                  <span key={n} className={`star ${n <= stars ? 'on' : ''}`}>
                    ★
                  </span>
                ))}
              </div>
            )}

            <p className="subtitle">
              {result === 'win' ? (
                <>
                  Your army stormed the <b>{LEVELS[difficulty].label}</b> boss!
                  <br />
                  <b>{finalCrowd}</b> survivors marching on.
                </>
              ) : (
                <>
                  The <b>{LEVELS[difficulty].label}</b> boss was too strong this time.
                  <br />
                  Pick smarter gates and try again!
                </>
              )}
            </p>

            <div className="score-box">
              <div className="score-row">
                <span>SCORE</span>
                <span className="score-val">{score}</span>
              </div>
              <div className="score-row best">
                <span>BEST</span>
                <span className="score-val">{highScores[difficulty] ?? 0}</span>
              </div>
              {isNewHigh && <div className="new-high">🎉 NEW HIGH SCORE!</div>}
            </div>

            <div className="btn-row">
              <button className="btn" onClick={restart}>
                ⟳ PLAY AGAIN
              </button>
              <button className="btn btn-secondary" onClick={toMenu}>
                ☰ CHANGE LEVEL
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
