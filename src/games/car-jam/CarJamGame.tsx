import { useEffect } from 'react'
import './car-jam.css'
import { HUD } from './components/HUD'
import { Scene } from './components/Scene'
import { useCarStore } from './state/store'

// Self-contained root for Car Jam. Own scene, store, generator, effects and CSS.
export function CarJamGame({ onExit }: { onExit: () => void }) {
  const phase = useCarStore((s) => s.phase)

  // pause on Esc/P, and auto-pause when the tab is hidden
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' || e.key === 'p' || e.key === 'P') {
        useCarStore.getState().togglePause()
      }
    }
    const onHide = () => {
      const s = useCarStore.getState()
      if (document.hidden && s.phase === 'playing' && !s.paused) s.togglePause()
    }
    window.addEventListener('keydown', onKey)
    document.addEventListener('visibilitychange', onHide)
    return () => {
      window.removeEventListener('keydown', onKey)
      document.removeEventListener('visibilitychange', onHide)
    }
  }, [])

  return (
    <div className="cj-app">
      <Scene />
      <HUD />
      {phase === 'start' && (
        <button className="cj-back" onClick={onExit}>
          ‹ Games
        </button>
      )}
    </div>
  )
}
