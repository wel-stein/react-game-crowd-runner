import { lazy, Suspense, useState, type ComponentType } from 'react'
import { Launcher } from './launcher/Launcher'

interface GameProps {
  onExit: () => void
}

// Lazy game modules — a game's code (and its globals/state) only loads when the
// player opens it, keeping each game fully isolated.
const GAME_COMPONENTS: Record<string, ComponentType<GameProps>> = {
  'crowd-runner': lazy(() =>
    import('./games/crowd-runner/CrowdRunnerGame').then((m) => ({ default: m.CrowdRunnerGame })),
  ),
  'wall-rush': lazy(() =>
    import('./games/wall-rush/WallRushGame').then((m) => ({ default: m.WallRushGame })),
  ),
  'crowd-clash': lazy(() =>
    import('./games/crowd-clash/CrowdClashGame').then((m) => ({ default: m.CrowdClashGame })),
  ),
  'car-jam': lazy(() =>
    import('./games/car-jam/CarJamGame').then((m) => ({ default: m.CarJamGame })),
  ),
  'chess-endgames': lazy(() =>
    import('./games/chess-endgames/ChessEndgamesGame').then((m) => ({
      default: m.ChessEndgamesGame,
    })),
  ),
}

export default function App() {
  const [activeId, setActiveId] = useState<string | null>(null)

  if (!activeId) return <Launcher onPlay={setActiveId} />

  const Game = GAME_COMPONENTS[activeId]
  if (!Game) return <Launcher onPlay={setActiveId} />

  return (
    <Suspense fallback={<div className="hub-loader">Loading…</div>}>
      {/* key remounts (and tears down) the game cleanly on every switch */}
      <Game key={activeId} onExit={() => setActiveId(null)} />
    </Suspense>
  )
}
