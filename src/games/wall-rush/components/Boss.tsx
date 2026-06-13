import { Html } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { useRef } from 'react'
import * as THREE from 'three'
import { wgame } from '../state/runtime'
import { useWallStore } from '../state/store'

// A hulking brown stone golem standing on the road at the end of the run.
export function Boss() {
  const ref = useRef<THREE.Group>(null!)
  const bossHealth = useWallStore((s) => s.bossHealth)
  const bossMax = useWallStore((s) => s.bossMax)
  const phase = useWallStore((s) => s.phase)
  const pct = Math.max(0, Math.min(1, bossHealth / bossMax)) * 100

  useFrame(() => {
    if (!ref.current) return
    ref.current.position.z = wgame.level.bossWorldZ + wgame.traveled
    ref.current.rotation.y = Math.sin(wgame.time * 1.4) * 0.05
    ref.current.position.x = phase === 'battle' ? (Math.random() - 0.5) * 0.28 : 0
  })

  const rock = '#7a5c3e'
  const dark = '#5e4730'
  const moss = '#6f8f3a'

  return (
    <group ref={ref}>
      {/* pedestal */}
      <mesh position={[0, 0.5, 0]} castShadow>
        <boxGeometry args={[4, 1, 3]} />
        <meshStandardMaterial color={dark} roughness={1} />
      </mesh>
      {/* legs */}
      <mesh position={[-0.8, 1.7, 0]} castShadow>
        <boxGeometry args={[0.9, 1.6, 1]} />
        <meshStandardMaterial color={rock} roughness={1} />
      </mesh>
      <mesh position={[0.8, 1.7, 0]} castShadow>
        <boxGeometry args={[0.9, 1.6, 1]} />
        <meshStandardMaterial color={rock} roughness={1} />
      </mesh>
      {/* torso */}
      <mesh position={[0, 3.4, 0]} castShadow>
        <boxGeometry args={[3.2, 2.8, 1.7]} />
        <meshStandardMaterial color={rock} roughness={1} />
      </mesh>
      <mesh position={[0, 4.0, 0.86]}>
        <boxGeometry args={[2, 1.4, 0.2]} />
        <meshStandardMaterial color={moss} roughness={1} />
      </mesh>
      {/* shoulders / fists */}
      <mesh position={[-2.1, 4.2, 0]} castShadow>
        <boxGeometry args={[1.3, 1.5, 1.7]} />
        <meshStandardMaterial color={dark} roughness={1} />
      </mesh>
      <mesh position={[2.1, 4.2, 0]} castShadow>
        <boxGeometry args={[1.3, 1.5, 1.7]} />
        <meshStandardMaterial color={dark} roughness={1} />
      </mesh>
      {/* head */}
      <mesh position={[0, 5.5, 0]} castShadow>
        <boxGeometry args={[1.5, 1.4, 1.4]} />
        <meshStandardMaterial color={rock} roughness={1} />
      </mesh>
      <mesh position={[-0.35, 5.6, 0.72]}>
        <boxGeometry args={[0.28, 0.16, 0.06]} />
        <meshStandardMaterial color="#ffd23b" emissive="#ffb000" emissiveIntensity={1.3} />
      </mesh>
      <mesh position={[0.35, 5.6, 0.72]}>
        <boxGeometry args={[0.28, 0.16, 0.06]} />
        <meshStandardMaterial color="#ffd23b" emissive="#ffb000" emissiveIntensity={1.3} />
      </mesh>

      {(phase === 'playing' || phase === 'battle') && (
        <Html center position={[0, 7.3, 0]} distanceFactor={16} style={{ pointerEvents: 'none' }}>
          <div className="wr-boss-hp">
            <div className="wr-boss-num">{bossHealth}</div>
            <div className="wr-boss-track">
              <div className="wr-boss-fill" style={{ width: `${pct}%` }} />
            </div>
          </div>
        </Html>
      )}
    </group>
  )
}
