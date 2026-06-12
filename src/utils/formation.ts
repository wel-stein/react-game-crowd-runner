import { MAX_RENDER, UNIT_SPACING } from '../config'
import { hash } from './math'

export interface UnitOffset {
  x: number
  z: number
  phase: number // bob phase offset
  bodyHue: number // 0..1 slight color variation
}

// Pre-compute a clustered "blob" formation using a sunflower (phyllotaxis)
// spiral so units pack tightly and evenly, plus per-unit jitter so it reads as
// an organic crowd rather than a grid. Index 0 is the leader at the front.
function buildFormation(): UnitOffset[] {
  const golden = Math.PI * (3 - Math.sqrt(5))
  const out: UnitOffset[] = []
  for (let i = 0; i < MAX_RENDER; i++) {
    const r = UNIT_SPACING * Math.sqrt(i)
    const theta = i * golden
    const jx = (hash(i * 1.7) - 0.5) * UNIT_SPACING * 0.6
    const jz = (hash(i * 3.3) - 0.5) * UNIT_SPACING * 0.6
    out.push({
      x: Math.cos(theta) * r + jx,
      // trail the blob behind the leader (toward the camera, +z)
      z: Math.sin(theta) * r * 0.55 + r * 0.35 + jz,
      phase: hash(i * 5.1) * Math.PI * 2,
      bodyHue: hash(i * 9.9),
    })
  }
  return out
}

export const FORMATION: UnitOffset[] = buildFormation()
