import { useFrame } from '@react-three/fiber'
import { useEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { onBurst } from '../utils/effects'

const POOL = 240
const PER_BURST = 20
const LIFE = 0.7

interface P {
  x: number
  y: number
  z: number
  vx: number
  vy: number
  vz: number
  life: number
}

const dummy = new THREE.Object3D()
const color = new THREE.Color()

// Pooled instanced particle burst, triggered imperatively via the effects bus.
export function Particles() {
  const ref = useRef<THREE.InstancedMesh>(null!)
  const particles = useMemo<P[]>(
    () => Array.from({ length: POOL }, () => ({ x: 0, y: 0, z: 0, vx: 0, vy: 0, vz: 0, life: 0 })),
    [],
  )
  const cursor = useRef(0)
  const geo = useMemo(() => new THREE.IcosahedronGeometry(0.12, 0), [])

  useEffect(() => {
    return onBurst((x, y, z, hex) => {
      color.set(hex)
      for (let i = 0; i < PER_BURST; i++) {
        const p = particles[cursor.current % POOL]
        cursor.current++
        const a = Math.random() * Math.PI * 2
        const sp = 2 + Math.random() * 4
        p.x = x
        p.y = y
        p.z = z
        p.vx = Math.cos(a) * sp
        p.vy = 2 + Math.random() * 4
        p.vz = Math.sin(a) * sp * 0.6
        p.life = LIFE
        if (ref.current) ref.current.setColorAt(cursor.current % POOL, color)
      }
      if (ref.current?.instanceColor) ref.current.instanceColor.needsUpdate = true
    })
  }, [particles])

  useFrame((_, rawDt) => {
    if (!ref.current) return
    const dt = Math.min(rawDt, 0.05)
    for (let i = 0; i < POOL; i++) {
      const p = particles[i]
      if (p.life > 0) {
        p.life -= dt
        p.vy -= 9 * dt
        p.x += p.vx * dt
        p.y += p.vy * dt
        p.z += p.vz * dt
        const s = Math.max(0, p.life / LIFE)
        dummy.position.set(p.x, Math.max(0, p.y), p.z)
        dummy.scale.setScalar(s)
        dummy.updateMatrix()
        ref.current.setMatrixAt(i, dummy.matrix)
      } else {
        dummy.position.set(0, -100, 0)
        dummy.scale.setScalar(0.0001)
        dummy.updateMatrix()
        ref.current.setMatrixAt(i, dummy.matrix)
      }
    }
    ref.current.instanceMatrix.needsUpdate = true
  })

  return (
    <instancedMesh ref={ref} args={[geo, undefined, POOL]} frustumCulled={false}>
      <meshStandardMaterial emissiveIntensity={0.5} toneMapped={false} />
    </instancedMesh>
  )
}
