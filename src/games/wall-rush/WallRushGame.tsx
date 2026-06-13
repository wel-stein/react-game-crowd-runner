import './wall-rush.css'
import { HUD } from './components/HUD'
import { Scene } from './components/Scene'
import { useWallStore } from './state/store'

// Self-contained root for Wall Rush. Own scene, store, runtime, effects and CSS.
export function WallRushGame({ onExit }: { onExit: () => void }) {
  const phase = useWallStore((s) => s.phase)
  return (
    <div className="wr-app">
      <Scene />
      <HUD />
      {phase === 'start' && (
        <button className="wr-back" onClick={onExit}>
          ‹ Games
        </button>
      )}
    </div>
  )
}
