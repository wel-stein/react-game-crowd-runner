import { useEffect } from 'react'
import { DRAG_RANGE, MAX_X } from '../config'
import { game } from '../state/game'
import { useGameStore } from '../state/store'
import { clamp } from '../utils/math'

// Wires up pointer-drag (mouse + touch) and keyboard steering. Writes straight
// into the live `game` runtime so there are no React re-renders while steering.
export function useControls(): void {
  useEffect(() => {
    let dragging = false
    let startPointerX = 0
    let startTargetX = 0

    const isPlaying = () => useGameStore.getState().phase === 'playing'

    const onPointerDown = (e: PointerEvent) => {
      if (!isPlaying()) return
      dragging = true
      startPointerX = e.clientX
      startTargetX = game.targetX
    }

    const onPointerMove = (e: PointerEvent) => {
      if (!dragging) return
      const dx = ((e.clientX - startPointerX) / window.innerWidth) * DRAG_RANGE
      game.targetX = clamp(startTargetX + dx, -MAX_X, MAX_X)
    }

    const endDrag = () => {
      dragging = false
    }

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') game.keyLeft = true
      if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') game.keyRight = true
    }
    const onKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') game.keyLeft = false
      if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') game.keyRight = false
    }

    window.addEventListener('pointerdown', onPointerDown)
    window.addEventListener('pointermove', onPointerMove)
    window.addEventListener('pointerup', endDrag)
    window.addEventListener('pointercancel', endDrag)
    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('keyup', onKeyUp)

    return () => {
      window.removeEventListener('pointerdown', onPointerDown)
      window.removeEventListener('pointermove', onPointerMove)
      window.removeEventListener('pointerup', endDrag)
      window.removeEventListener('pointercancel', endDrag)
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('keyup', onKeyUp)
    }
  }, [])
}
