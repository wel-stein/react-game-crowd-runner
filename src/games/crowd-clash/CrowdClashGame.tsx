import './crowd-clash.css'
import { HUD } from './components/HUD'
import { Scene } from './components/Scene'
import { useClashStore } from './state/store'

// Self-contained root for Crowd Clash. Own scene, store, runtime, effects, CSS.
export function CrowdClashGame({ onExit }: { onExit: () => void }) {
  const phase = useClashStore((s) => s.phase)
  return (
    <div className="cc-app">
      <Scene />
      <HUD />
      {phase === 'start' && (
        <button className="cc-back" onClick={onExit}>
          ‹ Games
        </button>
      )}
    </div>
  )
}
