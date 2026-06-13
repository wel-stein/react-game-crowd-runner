import { useFrame } from '@react-three/fiber'
import { useEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import {
  BOSS_STOP_Z,
  CROWD_BOB_HEIGHT,
  CROWD_BOB_SPEED,
  CROWD_HUE,
  CROWD_LIGHT,
  CROWD_SAT,
  LEADER_Z,
  MAX_CROWD,
  MAX_RENDER,
} from '../config'
import { wgame } from '../state/runtime'
import { useWallStore } from '../state/store'
import { FORMATION } from '../utils/formation'
import { clamp } from '../utils/math'

const dummy = new THREE.Object3D()
const color = new THREE.Color()

// Magenta army rendered as two InstancedMeshes (bodies + heads).
export function Crowd() {
  const bodies = useRef<THREE.InstancedMesh>(null!)
  const heads = useRef<THREE.InstancedMesh>(null!)
  const crowd = useWallStore((s) => s.crowd)
  const phase = useWallStore((s) => s.phase)
  const shown = useRef(0)

  const bodyGeo = useMemo(() => new THREE.CapsuleGeometry(0.17, 0.34, 4, 8), [])
  const headGeo = useMemo(() => new THREE.SphereGeometry(0.15, 10, 8), [])

  useEffect(() => {
    if (!bodies.current || !heads.current) return
    bodies.current.instanceMatrix.setUsage(THREE.DynamicDrawUsage)
    heads.current.instanceMatrix.setUsage(THREE.DynamicDrawUsage)
    for (let i = 0; i < MAX_RENDER; i++) {
      color.setHSL(CROWD_HUE + (FORMATION[i].shade - 0.5) * 0.08, CROWD_SAT, CROWD_LIGHT)
      bodies.current.setColorAt(i, color)
    }
    if (bodies.current.instanceColor) bodies.current.instanceColor.needsUpdate = true
  }, [])

  useFrame(() => {
    if (!bodies.current || !heads.current) return
    const target = Math.min(crowd, MAX_RENDER)
    shown.current += (target - shown.current) * 0.18
    const count = Math.max(0, Math.round(shown.current))

    const t = wgame.time
    const spread = 0.85 + Math.min(crowd, MAX_RENDER) / MAX_RENDER * 0.5
    const rush = phase === 'battle' ? wgame.battleRush * (LEADER_Z - BOSS_STOP_Z + 1.5) : 0
    const over = clamp((crowd - MAX_RENDER) / (MAX_CROWD - MAX_RENDER), 0, 1)
    const unitScale = 1 + over * 0.35

    for (let i = 0; i < MAX_RENDER; i++) {
      if (i < count) {
        const f = FORMATION[i]
        const bob = Math.sin(t * CROWD_BOB_SPEED + f.phase) * CROWD_BOB_HEIGHT
        const x = wgame.leaderX + f.x * spread
        const z = LEADER_Z + f.z * spread - rush
        dummy.position.set(x, (0.34 + Math.max(0, bob)) * unitScale, z)
        dummy.scale.setScalar(unitScale)
        dummy.updateMatrix()
        bodies.current.setMatrixAt(i, dummy.matrix)
        dummy.position.set(x, (0.68 + Math.max(0, bob)) * unitScale, z)
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
      <instancedMesh ref={bodies} args={[bodyGeo, undefined, MAX_RENDER]} castShadow frustumCulled={false}>
        <meshStandardMaterial roughness={0.55} />
      </instancedMesh>
      <instancedMesh ref={heads} args={[headGeo, undefined, MAX_RENDER]} castShadow frustumCulled={false}>
        <meshStandardMaterial color="#ffd9a8" roughness={0.7} />
      </instancedMesh>
    </group>
  )
}
