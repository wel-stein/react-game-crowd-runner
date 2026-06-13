import { Html } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { useRef } from 'react'
import * as THREE from 'three'
import { game } from '../state/game'
import { useGameStore } from '../state/store'

// A big armored block-figure standing on the road at the end of the level, with
// a floating health number above it.
export function Boss() {
  const ref = useRef<THREE.Group>(null!)
  const bossHealth = useGameStore((s) => s.bossHealth)
  const bossMax = useGameStore((s) => s.bossMax)
  const phase = useGameStore((s) => s.phase)
  const pct = Math.max(0, Math.min(1, bossHealth / bossMax)) * 100

  useFrame(() => {
    if (!ref.current) return
    ref.current.position.z = game.level.bossWorldZ + game.traveled
    // idle sway + a flinch when the battle is raging
    const sway = Math.sin(game.time * 1.6) * 0.05
    const flinch = phase === 'battle' ? (Math.random() - 0.5) * 0.25 : 0
    ref.current.rotation.y = sway
    ref.current.position.x = flinch
  })

  const armor = '#7a8190'
  const accent = '#cc3b4a'

  return (
    <group ref={ref}>
      {/* legs */}
      <mesh position={[-0.7, 0.9, 0]} castShadow>
        <boxGeometry args={[0.7, 1.8, 0.8]} />
        <meshStandardMaterial color={armor} roughness={0.5} metalness={0.3} />
      </mesh>
      <mesh position={[0.7, 0.9, 0]} castShadow>
        <boxGeometry args={[0.7, 1.8, 0.8]} />
        <meshStandardMaterial color={armor} roughness={0.5} metalness={0.3} />
      </mesh>
      {/* torso */}
      <mesh position={[0, 3.0, 0]} castShadow>
        <boxGeometry args={[2.6, 2.6, 1.4]} />
        <meshStandardMaterial color={armor} roughness={0.5} metalness={0.35} />
      </mesh>
      {/* chest plate accent */}
      <mesh position={[0, 3.0, 0.72]}>
        <boxGeometry args={[1.6, 1.6, 0.15]} />
        <meshStandardMaterial color={accent} roughness={0.4} metalness={0.4} />
      </mesh>
      {/* shoulders */}
      <mesh position={[-1.7, 3.8, 0]} castShadow>
        <boxGeometry args={[1.0, 1.0, 1.6]} />
        <meshStandardMaterial color={accent} roughness={0.5} metalness={0.3} />
      </mesh>
      <mesh position={[1.7, 3.8, 0]} castShadow>
        <boxGeometry args={[1.0, 1.0, 1.6]} />
        <meshStandardMaterial color={accent} roughness={0.5} metalness={0.3} />
      </mesh>
      {/* head */}
      <mesh position={[0, 4.9, 0]} castShadow>
        <boxGeometry args={[1.2, 1.2, 1.2]} />
        <meshStandardMaterial color={armor} roughness={0.5} metalness={0.35} />
      </mesh>
      {/* eyes */}
      <mesh position={[-0.3, 4.95, 0.62]}>
        <boxGeometry args={[0.22, 0.12, 0.05]} />
        <meshStandardMaterial color="#ff3030" emissive="#ff3030" emissiveIntensity={1.2} />
      </mesh>
      <mesh position={[0.3, 4.95, 0.62]}>
        <boxGeometry args={[0.22, 0.12, 0.05]} />
        <meshStandardMaterial color="#ff3030" emissive="#ff3030" emissiveIntensity={1.2} />
      </mesh>

      <Html center position={[0, 6.7, 0]} distanceFactor={16} style={{ pointerEvents: 'none' }}>
        <div className="boss-hp">
          <div className="boss-hp-num">👹 {bossHealth}</div>
          <div className="boss-hp-track">
            <div className="boss-hp-fill" style={{ width: `${pct}%` }} />
          </div>
        </div>
      </Html>
    </group>
  )
}
