import { useEffect } from 'react'
import { DRAG_RANGE, MAX_X } from '../config'
import { ccgame } from '../state/runtime'
import { useClashStore } from '../state/store'
import { clamp } from '../utils/math'

export function useControls(): void {
  useEffect(() => {
    let dragging = false
    let startPointerX = 0
    let startTargetX = 0
    const isPlaying = () => useClashStore.getState().phase === 'playing'

    const onPointerDown = (e: PointerEvent) => {
      if (!isPlaying()) return
      dragging = true
      startPointerX = e.clientX
      startTargetX = ccgame.targetX
    }
    const onPointerMove = (e: PointerEvent) => {
      if (!dragging) return
      const dx = ((e.clientX - startPointerX) / window.innerWidth) * DRAG_RANGE
      ccgame.targetX = clamp(startTargetX + dx, -MAX_X, MAX_X)
    }
    const endDrag = () => {
      dragging = false
    }
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') ccgame.keyLeft = true
      if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') ccgame.keyRight = true
      if (e.key === 'Escape' || e.key === 'p' || e.key === 'P') useClashStore.getState().togglePause()
    }
    const onKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') ccgame.keyLeft = false
      if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') ccgame.keyRight = false
    }
    const onVisibility = () => {
      const st = useClashStore.getState()
      if (document.hidden && (st.phase === 'playing' || st.phase === 'battle') && !st.paused) {
        st.togglePause()
      }
    }

    document.addEventListener('visibilitychange', onVisibility)
    window.addEventListener('pointerdown', onPointerDown)
    window.addEventListener('pointermove', onPointerMove)
    window.addEventListener('pointerup', endDrag)
    window.addEventListener('pointercancel', endDrag)
    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('keyup', onKeyUp)
    return () => {
      document.removeEventListener('visibilitychange', onVisibility)
      window.removeEventListener('pointerdown', onPointerDown)
      window.removeEventListener('pointermove', onPointerMove)
      window.removeEventListener('pointerup', endDrag)
      window.removeEventListener('pointercancel', endDrag)
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('keyup', onKeyUp)
    }
  }, [])
}
