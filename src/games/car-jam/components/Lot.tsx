import { useMemo } from 'react'
import { CELL_SIZE, COLORS, LOT_TOP } from '../config'
import { useCarStore } from '../state/store'

// The parking lot: an asphalt slab, painted lane lines and a light curb.
export function Lot() {
  const cols = useCarStore((s) => s.cols)
  const rows = useCarStore((s) => s.rows)

  const w = cols * CELL_SIZE
  const d = rows * CELL_SIZE

  // painted lines between columns/rows
  const lines = useMemo(() => {
    const out: { key: string; pos: [number, number]; size: [number, number] }[] = []
    for (let c = 1; c < cols; c++) {
      const x = (c - cols / 2) * CELL_SIZE
      out.push({ key: `c${c}`, pos: [x, 0], size: [0.05, d - 0.3] })
    }
    for (let r = 1; r < rows; r++) {
      const z = (r - rows / 2) * CELL_SIZE
      out.push({ key: `r${r}`, pos: [0, z], size: [w - 0.3, 0.05] })
    }
    return out
  }, [cols, rows, w, d])

  return (
    <group>
      {/* curb slab (cars sit on its top face at LOT_TOP) */}
      <mesh position={[0, LOT_TOP / 2, 0]} receiveShadow>
        <boxGeometry args={[w + 0.5, LOT_TOP, d + 0.5]} />
        <meshStandardMaterial color={COLORS.curb} roughness={0.85} />
      </mesh>
      {/* asphalt surface */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, LOT_TOP + 0.001, 0]} receiveShadow>
        <planeGeometry args={[w, d]} />
        <meshStandardMaterial color={COLORS.lot} roughness={0.95} />
      </mesh>
      {/* painted lane lines */}
      {lines.map((l) => (
        <mesh
          key={l.key}
          rotation={[-Math.PI / 2, 0, 0]}
          position={[l.pos[0], LOT_TOP + 0.012, l.pos[1]]}
        >
          <planeGeometry args={[l.size[0], l.size[1]]} />
          <meshStandardMaterial color={COLORS.lotLine} roughness={0.7} />
        </mesh>
      ))}
    </group>
  )
}
