import { useThree } from '@react-three/fiber'
import { useEffect } from 'react'
import { useCarStore } from '../state/store'

// Frame the whole lot from a tilted, slightly-overhead angle (like the
// reference art). Re-aims whenever the grid size changes (difficulty switch).
export function CameraRig() {
  const camera = useThree((s) => s.camera)
  const cols = useCarStore((s) => s.cols)
  const rows = useCarStore((s) => s.rows)

  useEffect(() => {
    const span = Math.max(cols, rows)
    camera.position.set(0, span * 1.35 + 2, span * 1.05 + 2)
    camera.lookAt(0, 0, 0)
    camera.updateProjectionMatrix()
  }, [camera, cols, rows])

  return null
}
