import { Html } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { useEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import {
  CROWD_BOB_HEIGHT,
  CROWD_BOB_SPEED,
  MAX_CROWD,
  MAX_RENDER,
} from '../config'
import { ccgame } from '../state/runtime'
import { FORMATION } from '../utils/formation'
import { clamp } from '../utils/math'

const dummy = new THREE.Object3D()
const color = new THREE.Color()

interface Props {
  count: number
  hue: number
  getCenter: () => [number, number] // [x, z] of the blob each frame
  label?: number // optional floating count (rival)
  labelClass?: string
}

// Reusable instanced army (bodies + heads). Used for both the player and the
// rival crowd, differing only by color / position / label.
export function Crowd({ count, hue, getCenter, label, labelClass }: Props) {
  const bodies = useRef<THREE.InstancedMesh>(null!)
  const heads = useRef<THREE.InstancedMesh>(null!)
  const labelRef = useRef<THREE.Group>(null!)
  const shown = useRef(0)

  const bodyGeo = useMemo(() => new THREE.CapsuleGeometry(0.17, 0.34, 4, 8), [])
  const headGeo = useMemo(() => new THREE.SphereGeometry(0.15, 10, 8), [])

  useEffect(() => {
    if (!bodies.current || !heads.current) return
    bodies.current.instanceMatrix.setUsage(THREE.DynamicDrawUsage)
    heads.current.instanceMatrix.setUsage(THREE.DynamicDrawUsage)
    for (let i = 0; i < MAX_RENDER; i++) {
      color.setHSL(hue + (FORMATION[i].shade - 0.5) * 0.06, 0.7, 0.55)
      bodies.current.setColorAt(i, color)
    }
    if (bodies.current.instanceColor) bodies.current.instanceColor.needsUpdate = true
  }, [hue])

  useFrame(() => {
    if (!bodies.current || !heads.current) return
    const target = Math.min(count, MAX_RENDER)
    shown.current += (target - shown.current) * 0.18
    const n = Math.max(0, Math.round(shown.current))

    const t = ccgame.time
    const [cx, cz] = getCenter()
    const spread = 0.85 + Math.min(count, MAX_RENDER) / MAX_RENDER * 0.5
    const over = clamp((count - MAX_RENDER) / (MAX_CROWD - MAX_RENDER), 0, 1)
    const unitScale = 1 + over * 0.35

    for (let i = 0; i < MAX_RENDER; i++) {
      if (i < n) {
        const f = FORMATION[i]
        const bob = Math.sin(t * CROWD_BOB_SPEED + f.phase) * CROWD_BOB_HEIGHT
        const x = cx + f.x * spread
        const z = cz + f.z * spread
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

    if (labelRef.current) labelRef.current.position.set(cx, 1.9, cz)
  })

  return (
    <group>
      <instancedMesh ref={bodies} args={[bodyGeo, undefined, MAX_RENDER]} castShadow frustumCulled={false}>
        <meshStandardMaterial roughness={0.6} />
      </instancedMesh>
      <instancedMesh ref={heads} args={[headGeo, undefined, MAX_RENDER]} castShadow frustumCulled={false}>
        <meshStandardMaterial color="#ffd9a8" roughness={0.7} />
      </instancedMesh>
      {label !== undefined && (
        <group ref={labelRef}>
          <Html center distanceFactor={15} style={{ pointerEvents: 'none' }}>
            <div className={labelClass}>{label}</div>
          </Html>
        </group>
      )}
    </group>
  )
}
