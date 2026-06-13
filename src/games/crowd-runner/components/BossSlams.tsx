import { useFrame } from '@react-three/fiber'
import { useRef } from 'react'
import * as THREE from 'three'
import { GATE_HIT_Z, ROAD_WIDTH, SLAM_TELEGRAPH } from '../config'
import { game } from '../state/game'

const ZONE_W = ROAD_WIDTH / 2 - 0.2
const ZONE_X = ROAD_WIDTH / 4

// Renders the flashing red "danger half" on the road while the boss telegraphs
// a slam, so the player knows which side to steer away from. One pad per slam.
function SlamPad({ index }: { index: number }) {
  const ref = useRef<THREE.Mesh>(null!)
  const mat = useRef<THREE.MeshStandardMaterial>(null!)

  useFrame(() => {
    const slam = game.slams[index]
    if (!ref.current || !mat.current) return
    const active = slam && slam.warnStart !== null && !slam.resolved
    ref.current.visible = !!active
    if (!active || slam.warnStart === null) return
    ref.current.position.x = slam.side * ZONE_X
    const tele = (game.time - slam.warnStart) / SLAM_TELEGRAPH // 0..1
    // pulse faster and brighter as impact approaches
    const pulse = 0.35 + 0.45 * Math.abs(Math.sin(game.time * (6 + tele * 14)))
    mat.current.opacity = pulse
    mat.current.emissiveIntensity = 0.4 + tele * 0.8
  })

  return (
    <mesh ref={ref} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, GATE_HIT_Z]} visible={false}>
      <planeGeometry args={[ZONE_W, 9]} />
      <meshStandardMaterial
        ref={mat}
        color="#ff3b4a"
        emissive="#ff3b4a"
        transparent
        opacity={0.4}
        depthWrite={false}
      />
    </mesh>
  )
}

export function BossSlams() {
  // Max two slams across all difficulties; pads simply stay hidden if unused.
  return (
    <group>
      <SlamPad index={0} />
      <SlamPad index={1} />
    </group>
  )
}
