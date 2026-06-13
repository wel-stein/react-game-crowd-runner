import { Html } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { useRef } from 'react'
import * as THREE from 'three'
import { cellColor, cellLabel, ROW_SPACING, WALL_X, type Cell } from '../config'
import { wgame, type Row } from '../state/runtime'
import { useWallStore } from '../state/store'

const SEG_W = 1.5
const SEG_H = 1.3
const SEG_D = ROW_SPACING * 0.86

function Segment({ cell, x, showLabel }: { cell: Cell; x: number; showLabel: boolean }) {
  const color = cellColor(cell.kind)
  return (
    <group position={[x, SEG_H / 2, 0]}>
      <mesh castShadow>
        <boxGeometry args={[SEG_W, SEG_H, SEG_D]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.28} roughness={0.5} />
      </mesh>
      {showLabel && (
        <Html
          center
          position={[x < 0 ? SEG_W / 2 + 0.05 : -SEG_W / 2 - 0.05, 0.15, 0]}
          distanceFactor={12}
          style={{ pointerEvents: 'none' }}
        >
          <div className={`wr-cell ${cell.kind === 'penalty' ? 'bad' : ''}`}>{cellLabel(cell)}</div>
        </Html>
      )}
    </group>
  )
}

function WallRow({ row, index, showLabels }: { row: Row; index: number; showLabels: boolean }) {
  const ref = useRef<THREE.Group>(null!)
  const leftRef = useRef<THREE.Group>(null!)
  const rightRef = useRef<THREE.Group>(null!)

  useFrame(() => {
    if (!ref.current) return
    const z = row.worldZ + wgame.traveled
    ref.current.position.z = z
    const visible = z > -110 && z < 16
    ref.current.visible = visible
    if (!visible) return
    // collected segment gets sucked into the crowd
    const lc = row.collected === 'left'
    const rc = row.collected === 'right'
    leftRef.current?.scale.lerp(lc ? ZERO : ONE, 0.3)
    rightRef.current?.scale.lerp(rc ? ZERO : ONE, 0.3)
  })

  // keep DOM overlays light: label every gold/trap segment, but only every
  // 3rd repetitive blue "+1" segment
  return (
    <group ref={ref}>
      <group ref={leftRef}>
        <Segment cell={row.left} x={-WALL_X} showLabel={showLabels && index % 3 === 0} />
      </group>
      <group ref={rightRef}>
        <Segment cell={row.right} x={WALL_X} showLabel={showLabels} />
      </group>
    </group>
  )
}

const ZERO = new THREE.Vector3(0.0001, 0.0001, 0.0001)
const ONE = new THREE.Vector3(1, 1, 1)

export function Walls() {
  const runId = useWallStore((s) => s.runId)
  const phase = useWallStore((s) => s.phase)
  const showLabels = phase === 'playing' || phase === 'battle'
  return (
    <group key={runId}>
      {wgame.rows.map((r, i) => (
        <WallRow key={i} row={r} index={i} showLabels={showLabels} />
      ))}
    </group>
  )
}
