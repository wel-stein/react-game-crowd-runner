import { useEffect, useRef, useState } from 'react'
import { DIFFICULTY_ORDER, LEVELS } from '../config'
import { useWallStore } from '../state/store'

// Wall Rush 2D UI. All classes are wr- prefixed so nothing clashes with other
// games' styles.
export function HUD() {
  const phase = useWallStore((s) => s.phase)
  const crowd = useWallStore((s) => s.crowd)
  const popKey = useWallStore((s) => s.popKey)
  const progress = useWallStore((s) => s.progress)
  const result = useWallStore((s) => s.result)
  const finalCrowd = useWallStore((s) => s.finalCrowd)
  const difficulty = useWallStore((s) => s.difficulty)
  const clashCrowd = useWallStore((s) => s.clashCrowd)
  const bossMax = useWallStore((s) => s.bossMax)
  const paused = useWallStore((s) => s.paused)
  const score = useWallStore((s) => s.score)
  const stars = useWallStore((s) => s.stars)
  const highScores = useWallStore((s) => s.highScores)
  const isNewHigh = useWallStore((s) => s.isNewHigh)
  const start = useWallStore((s) => s.start)
  const restart = useWallStore((s) => s.restart)
  const toMenu = useWallStore((s) => s.toMenu)
  const togglePause = useWallStore((s) => s.togglePause)

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
    <div className="wr-hud">
      {showCounter && (
        <>
          <div className={`wr-counter ${pop ? 'pop' : ''}`}>
            <span>👥</span>
            {crowd}
          </div>
          <div className="wr-progress">
            <div className="wr-track">
              <div className="wr-fill" style={{ width: `${progress * 100}%` }} />
              <div className="wr-flag" style={{ left: `calc(${progress * 100}% - 10px)` }}>
                🪨
              </div>
            </div>
            <div className="wr-progress-label">GOLEM</div>
          </div>
          <div className={`wr-badge wr-${difficulty}`}>{LEVELS[difficulty].label}</div>
          {phase === 'playing' && (
            <button className="wr-pause" onClick={togglePause} aria-label="Pause">
              ❚❚
            </button>
          )}
        </>
      )}

      {phase === 'battle' && (
        <div className="wr-showdown">
          <span className="wr-sd you">{clashCrowd}</span>
          <span className="wr-sd-vs">VS</span>
          <span className="wr-sd boss">{bossMax}</span>
        </div>
      )}

      {paused && (
        <div className="wr-overlay">
          <div className="wr-panel">
            <h1 className="wr-title">PAUSED</h1>
            <div className="wr-btn-row">
              <button className="wr-btn" onClick={togglePause}>
                ▶ RESUME
              </button>
              <button className="wr-btn wr-btn-2" onClick={toMenu}>
                ☰ QUIT
              </button>
            </div>
          </div>
        </div>
      )}

      {phase === 'start' && (
        <div className="wr-overlay">
          <div className="wr-panel">
            <h1 className="wr-title">WALL RUSH</h1>
            <p className="wr-sub">
              Drag or use <b>← →</b> / <b>A&nbsp;D</b> to steer.
              <br />
              Hug the <b style={{ color: '#ffce3a' }}>+99</b> wall to grow fast — but swerve away
              from the <b style={{ color: '#ff4b4b' }}>÷2</b> traps!
            </p>
            <p className="wr-choose">CHOOSE DIFFICULTY</p>
            <div className="wr-diff-list">
              {DIFFICULTY_ORDER.map((id) => {
                const lvl = LEVELS[id]
                const best = highScores[id] ?? 0
                return (
                  <button key={id} className={`wr-diff wr-${id}`} onClick={() => start(id)}>
                    <span className="wr-diff-name">{lvl.label}</span>
                    <span className="wr-diff-tag">{lvl.blurb}</span>
                    <span className="wr-diff-boss">🪨 {lvl.bossHealth}</span>
                    {best > 0 && <span className="wr-diff-best">★ best {best}</span>}
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {(phase === 'win' || phase === 'lose') && (
        <div className="wr-overlay">
          <div className="wr-panel">
            <h1 className={`wr-title ${result === 'win' ? 'win' : 'lose'}`}>
              {result === 'win' ? '🏆 GOLEM SMASHED!' : '💀 CRUSHED'}
            </h1>
            {result === 'win' && (
              <div className="wr-stars">
                {[1, 2, 3].map((n) => (
                  <span key={n} className={`wr-star ${n <= stars ? 'on' : ''}`}>
                    ★
                  </span>
                ))}
              </div>
            )}
            <p className="wr-sub">
              {result === 'win' ? (
                <>
                  Your mob flattened the <b>{LEVELS[difficulty].label}</b> golem!
                  <br />
                  <b>{finalCrowd}</b> survivors.
                </>
              ) : (
                <>
                  The <b>{LEVELS[difficulty].label}</b> golem held the line.
                  <br />
                  Dodge the ÷2 traps and try again!
                </>
              )}
            </p>
            <div className="wr-score">
              <div className="wr-score-row">
                <span>SCORE</span>
                <span className="wr-score-v">{score}</span>
              </div>
              <div className="wr-score-row best">
                <span>BEST</span>
                <span className="wr-score-v">{highScores[difficulty] ?? 0}</span>
              </div>
              {isNewHigh && <div className="wr-newhigh">🎉 NEW HIGH SCORE!</div>}
            </div>
            <div className="wr-btn-row">
              <button className="wr-btn" onClick={restart}>
                ⟳ PLAY AGAIN
              </button>
              <button className="wr-btn wr-btn-2" onClick={toMenu}>
                ☰ CHANGE LEVEL
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
