import './crowd-runner.css'
import { HUD } from './components/HUD'
import { Scene } from './components/Scene'
import { useGameStore } from './state/store'

// Self-contained root for the Crowd Runner game. Fully isolated: its own scene,
// zustand store, runtime singleton, effects bus and CSS. Only mounted while the
// player is in this game, so nothing here can interfere with other games.
export function CrowdRunnerGame({ onExit }: { onExit: () => void }) {
  const phase = useGameStore((s) => s.phase)
  return (
    <div className="app">
      <Scene />
      <HUD />
      {phase === 'start' && (
        <button className="game-back" onClick={onExit}>
          ‹ Games
        </button>
      )}
    </div>
  )
}
