import './launcher.css'
import { GAMES } from './registry'

// The home screen: a grid of game cards. Tapping a card asks App to mount that
// game. Pure presentation — it never imports a game's code.
export function Launcher({ onPlay }: { onPlay: (id: string) => void }) {
  return (
    <div className="hub-root">
      <div className="hub-inner">
        <header className="hub-head">
          <h1 className="hub-title">🎮 GAME HUB</h1>
          <p className="hub-sub">Pick a game to play</p>
        </header>

        <div className="hub-grid">
          {GAMES.map((g) => (
            <button
              key={g.id}
              className="hub-card"
              style={{
                background: `linear-gradient(150deg, ${g.accent}, ${shade(g.accent, -28)})`,
              }}
              onClick={() => onPlay(g.id)}
            >
              <span className="hub-card-icon">{g.emoji}</span>
              <span className="hub-card-body">
                <span className="hub-card-title">{g.title}</span>
                <span className="hub-card-tag">{g.tagline}</span>
              </span>
              <span className="hub-card-play">▶</span>
            </button>
          ))}
        </div>

        <footer className="hub-foot">More games coming soon</footer>
      </div>
    </div>
  )
}

// darken a hex color by `amt` (negative) for the card gradient
function shade(hex: string, amt: number): string {
  const n = parseInt(hex.slice(1), 16)
  const r = Math.max(0, Math.min(255, ((n >> 16) & 255) + amt))
  const g = Math.max(0, Math.min(255, ((n >> 8) & 255) + amt))
  const b = Math.max(0, Math.min(255, (n & 255) + amt))
  return `rgb(${r}, ${g}, ${b})`
}
