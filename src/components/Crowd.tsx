import { useFrame } from '@react-three/fiber'
import { useEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import {
  BOSS_STOP_Z,
  CROWD_BOB_HEIGHT,
  CROWD_BOB_SPEED,
  LEADER_Z,
  MAX_RENDER,
} from '../config'
import { game } from '../state/game'
import { useGameStore } from '../state/store'
import { FORMATION } from '../utils/formation'

const dummy = new THREE.Object3D()
const color = new THREE.Color()

// Renders the whole crowd as two InstancedMeshes (bodies + heads) so hundreds
// of units draw in just two draw calls. Per-unit position, bob animation and
// color variation are written into the instance matrices every frame.
export function Crowd() {
  const bodies = useRef<THREE.InstancedMesh>(null!)
  const heads = useRef<THREE.InstancedMesh>(null!)
  const crowd = useGameStore((s) => s.crowd)
  const phase = useGameStore((s) => s.phase)

  // smoothed rendered count so units fade in/out instead of popping all at once
  const shown = useRef(0)

  const bodyGeo = useMemo(() => new THREE.CapsuleGeometry(0.17, 0.34, 4, 8), [])
  const headGeo = useMemo(() => new THREE.SphereGeometry(0.15, 10, 8), [])

  // assign slightly varied body colors once
  useEffect(() => {
    if (!bodies.current) return
    for (let i = 0; i < MAX_RENDER; i++) {
      const h = 0.58 + (FORMATION[i].bodyHue - 0.5) * 0.12
      color.setHSL(h, 0.6, 0.55)
      bodies.current.setColorAt(i, color)
    }
    if (bodies.current.instanceColor) bodies.current.instanceColor.needsUpdate = true
  }, [])

  useFrame(() => {
    if (!bodies.current || !heads.current) return

    const target = Math.min(crowd, MAX_RENDER)
    shown.current += (target - shown.current) * 0.18
    const count = Math.max(0, Math.round(shown.current))

    const t = game.time
    // cluster scale grows with crowd size so big armies spread out a little
    const spread = 0.85 + Math.min(crowd, MAX_RENDER) / MAX_RENDER * 0.5
    const rush = phase === 'battle' ? game.battleRush * (LEADER_Z - BOSS_STOP_Z + 1.5) : 0

    for (let i = 0; i < MAX_RENDER; i++) {
      if (i < count) {
        const f = FORMATION[i]
        const bob = Math.sin(t * CROWD_BOB_SPEED + f.phase) * CROWD_BOB_HEIGHT
        const x = game.leaderX + f.x * spread
        const z = LEADER_Z + f.z * spread - rush
        // body
        dummy.position.set(x, 0.34 + Math.max(0, bob), z)
        dummy.rotation.set(0, 0, 0)
        dummy.scale.setScalar(1)
        dummy.updateMatrix()
        bodies.current.setMatrixAt(i, dummy.matrix)
        // head
        dummy.position.set(x, 0.68 + Math.max(0, bob), z)
        dummy.scale.setScalar(1)
        dummy.updateMatrix()
        heads.current.setMatrixAt(i, dummy.matrix)
      } else {
        dummy.position.set(0, -50, 0)
        dummy.scale.setScalar(0.0001)
        dummy.updateMatrix()
        bodies.current.setMatrixAt(i, dummy.matrix)
        heads.current.setMatrixAt(i, dummy.matrix)
      }
    }
    bodies.current.instanceMatrix.needsUpdate = true
    heads.current.instanceMatrix.needsUpdate = true
    bodies.current.count = MAX_RENDER
    heads.current.count = MAX_RENDER
  })

  return (
    <group>
      <instancedMesh
        ref={bodies}
        args={[bodyGeo, undefined, MAX_RENDER]}
        castShadow
        frustumCulled={false}
      >
        <meshStandardMaterial roughness={0.6} />
      </instancedMesh>
      <instancedMesh
        ref={heads}
        args={[headGeo, undefined, MAX_RENDER]}
        castShadow
        frustumCulled={false}
      >
        <meshStandardMaterial color="#ffd9a8" roughness={0.7} />
      </instancedMesh>
    </group>
  )
}
