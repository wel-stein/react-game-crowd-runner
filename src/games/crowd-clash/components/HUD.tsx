import { useEffect, useRef, useState } from 'react'
import { DIFFICULTY_ORDER, LEVELS } from '../config'
import { useClashStore } from '../state/store'

export function HUD() {
  const phase = useClashStore((s) => s.phase)
  const crowd = useClashStore((s) => s.crowd)
  const rival = useClashStore((s) => s.rival)
  const popKey = useClashStore((s) => s.popKey)
  const progress = useClashStore((s) => s.progress)
  const result = useClashStore((s) => s.result)
  const finalCrowd = useClashStore((s) => s.finalCrowd)
  const difficulty = useClashStore((s) => s.difficulty)
  const clashYou = useClashStore((s) => s.clashYou)
  const clashRival = useClashStore((s) => s.clashRival)
  const paused = useClashStore((s) => s.paused)
  const score = useClashStore((s) => s.score)
  const stars = useClashStore((s) => s.stars)
  const highScores = useClashStore((s) => s.highScores)
  const isNewHigh = useClashStore((s) => s.isNewHigh)
  const start = useClashStore((s) => s.start)
  const restart = useClashStore((s) => s.restart)
  const toMenu = useClashStore((s) => s.toMenu)
  const togglePause = useClashStore((s) => s.togglePause)

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

  const showHud = phase === 'playing' || phase === 'battle'
  const lead = crowd - rival

  return (
    <div className="cc-hud">
      {showHud && (
        <>
          <div className={`cc-counter ${pop ? 'pop' : ''}`}>
            <span>🏃</span>
            {crowd}
            <span className={`cc-lead ${lead >= 0 ? 'up' : 'down'}`}>
              {lead >= 0 ? `+${lead}` : lead}
            </span>
          </div>
          <div className="cc-progress">
            <div className="cc-track">
              <div className="cc-fill" style={{ width: `${progress * 100}%` }} />
              <div className="cc-flag" style={{ left: `calc(${progress * 100}% - 10px)` }}>
                ⚔️
              </div>
            </div>
            <div className="cc-progress-label">CLASH</div>
          </div>
          <div className={`cc-badge cc-${difficulty}`}>{LEVELS[difficulty].label}</div>
          {phase === 'playing' && (
            <button className="cc-pause" onClick={togglePause} aria-label="Pause">
              ❚❚
            </button>
          )}
        </>
      )}

      {phase === 'battle' && (
        <div className="cc-showdown">
          <span className="cc-sd you">{clashYou}</span>
          <span className="cc-sd-vs">VS</span>
          <span className="cc-sd rival">{clashRival}</span>
        </div>
      )}

      {paused && (
        <div className="cc-overlay">
          <div className="cc-panel">
            <h1 className="cc-title">PAUSED</h1>
            <div className="cc-btn-row">
              <button className="cc-btn" onClick={togglePause}>
                ▶ RESUME
              </button>
              <button className="cc-btn cc-btn-2" onClick={toMenu}>
                ☰ QUIT
              </button>
            </div>
          </div>
        </div>
      )}

      {phase === 'start' && (
        <div className="cc-overlay">
          <div className="cc-panel">
            <h1 className="cc-title">CROWD CLASH</h1>
            <p className="cc-sub">
              Race the <b style={{ color: '#ff5563' }}>red rival</b> army! Each section, grab the
              better gate — the rival takes the other. Drag or <b>← →</b> / <b>A&nbsp;D</b> to steer.
              <br />
              Biggest army wins the final clash.
            </p>
            <p className="cc-choose">CHOOSE DIFFICULTY</p>
            <div className="cc-diff-list">
              {DIFFICULTY_ORDER.map((id) => {
                const lvl = LEVELS[id]
                const best = highScores[id] ?? 0
                return (
                  <button key={id} className={`cc-diff cc-${id}`} onClick={() => start(id)}>
                    <span className="cc-diff-name">{lvl.label}</span>
                    <span className="cc-diff-tag">{lvl.blurb}</span>
                    <span className="cc-diff-skill">🤖 {Math.round(lvl.rivalSkill * 100)}%</span>
                    {best > 0 && <span className="cc-diff-best">★ best {best}</span>}
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {(phase === 'win' || phase === 'lose') && (
        <div className="cc-overlay">
          <div className="cc-panel">
            <h1 className={`cc-title ${result === 'win' ? 'win' : 'lose'}`}>
              {result === 'win' ? '🏆 YOU WIN!' : '💀 OUTNUMBERED'}
            </h1>
            {result === 'win' && (
              <div className="cc-stars">
                {[1, 2, 3].map((n) => (
                  <span key={n} className={`cc-star ${n <= stars ? 'on' : ''}`}>
                    ★
                  </span>
                ))}
              </div>
            )}
            <p className="cc-sub">
              {result === 'win' ? (
                <>
                  Your <b>{clashYou}</b> crushed the rival's <b>{clashRival}</b>!
                  <br />
                  <b>{finalCrowd}</b> survivors.
                </>
              ) : (
                <>
                  The rival's <b>{clashRival}</b> beat your <b>{clashYou}</b>.
                  <br />
                  Pick the better gates and try again!
                </>
              )}
            </p>
            <div className="cc-score">
              <div className="cc-score-row">
                <span>SCORE</span>
                <span className="cc-score-v">{score}</span>
              </div>
              <div className="cc-score-row best">
                <span>BEST</span>
                <span className="cc-score-v">{highScores[difficulty] ?? 0}</span>
              </div>
              {isNewHigh && <div className="cc-newhigh">🎉 NEW HIGH SCORE!</div>}
            </div>
            <div className="cc-btn-row">
              <button className="cc-btn" onClick={restart}>
                ⟳ PLAY AGAIN
              </button>
              <button className="cc-btn cc-btn-2" onClick={toMenu}>
                ☰ CHANGE LEVEL
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
