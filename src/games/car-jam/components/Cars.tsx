import { useFrame } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import * as THREE from 'three'
import { CAR_GAP, CAR_HEIGHT, CAR_WIDTH, CELL_SIZE, LEAVE_TIME, LOT_TOP, BUMP_TIME } from '../config'
import { useCarStore } from '../state/store'
import { carCenter, type Car as CarData } from '../utils/grid'
import { SHAKE_SCALE } from '../utils/env'

const easeOut = (t: number) => 1 - (1 - t) * (1 - t)

// A flat triangular arrow lying in the roof plane (XZ), apex pointing +X. It's
// the same mesh for every car — only the per-car yaw differs — so it reads as a
// crisp directional arrow from every angle (a side-on cone looked like a
// diamond when it pointed toward the camera).
const ARROW_GEOMETRY = (() => {
  const g = new THREE.BufferGeometry()
  g.setAttribute(
    'position',
    new THREE.Float32BufferAttribute([0.26, 0, 0, -0.18, 0, -0.2, -0.18, 0, 0.2], 3),
  )
  g.setIndex([0, 1, 2])
  g.computeVertexNormals()
  return g
})()

function Car({ car }: { car: CarData }) {
  const cols = useCarStore((s) => s.cols)
  const rows = useCarStore((s) => s.rows)
  const bump = useCarStore((s) => s.bump)
  const tapCar = useCarStore((s) => s.tapCar)
  const removeCar = useCarStore((s) => s.removeCar)

  const groupRef = useRef<THREE.Group>(null)
  const leaveProg = useRef(0)
  const removed = useRef(false)
  const bumpStart = useRef(-1)
  const lastBumpKey = useRef(0)

  const [bx, bz] = useMemo(() => carCenter(car, cols, rows), [car, cols, rows])
  const baseY = LOT_TOP + CAR_HEIGHT / 2
  const along = car.len * CELL_SIZE - CAR_GAP
  const [dc, dr] = car.dir

  // body box dimensions depend on orientation
  const bodyArgs: [number, number, number] =
    car.orient === 'h' ? [along, CAR_HEIGHT, CAR_WIDTH] : [CAR_WIDTH, CAR_HEIGHT, along]
  const cabinArgs: [number, number, number] =
    car.orient === 'h'
      ? [along * 0.5, CAR_HEIGHT * 0.7, CAR_WIDTH * 0.78]
      : [CAR_WIDTH * 0.78, CAR_HEIGHT * 0.7, along * 0.5]

  // yaw that turns the flat +X arrow to face the exit direction [dc, 0, dr]
  const arrowYaw = useMemo(() => Math.atan2(-dr, dc), [dc, dr])

  const exitDist = (Math.max(cols, rows) + car.len) * CELL_SIZE + 2

  useFrame((state, dt) => {
    const g = groupRef.current
    if (!g) return
    const t = state.clock.getElapsedTime()

    if (car.status === 'leaving') {
      leaveProg.current = Math.min(1, leaveProg.current + dt / LEAVE_TIME)
      const e = easeOut(leaveProg.current)
      g.position.set(bx + dc * e * exitDist, baseY + e * 0.15, bz + dr * e * exitDist)
      const s = 1 - 0.25 * e
      g.scale.setScalar(s)
      if (leaveProg.current >= 1 && !removed.current) {
        removed.current = true
        removeCar(car.id)
      }
      return
    }

    // blocked-tap shake: lurch forward along dir and settle back
    if (bump && bump.id === car.id && bump.key !== lastBumpKey.current) {
      lastBumpKey.current = bump.key
      bumpStart.current = t
    }
    let off = 0
    if (bumpStart.current >= 0) {
      const bt = (t - bumpStart.current) / BUMP_TIME
      if (bt >= 1) bumpStart.current = -1
      else off = Math.sin(bt * Math.PI * 3) * (1 - bt) * 0.14 * SHAKE_SCALE
    }
    g.position.set(bx + dc * off, baseY, bz + dr * off)
    g.scale.setScalar(1)
  })

  if (car.status === 'gone') return null

  return (
    <group
      ref={groupRef}
      position={[bx, baseY, bz]}
      onPointerDown={(e) => {
        e.stopPropagation()
        if (car.status === 'parked') tapCar(car.id)
      }}
      onPointerOver={() => (document.body.style.cursor = 'pointer')}
      onPointerOut={() => (document.body.style.cursor = 'auto')}
    >
      <mesh castShadow receiveShadow>
        <boxGeometry args={bodyArgs} />
        <meshStandardMaterial color={car.color} roughness={0.45} metalness={0.15} />
      </mesh>
      <mesh position={[0, CAR_HEIGHT * 0.55, 0]} castShadow>
        <boxGeometry args={cabinArgs} />
        <meshStandardMaterial
          color={new THREE.Color(car.color).multiplyScalar(0.7)}
          roughness={0.3}
          metalness={0.2}
        />
      </mesh>
      {/* white direction arrow lying flat on the roof */}
      <mesh
        geometry={ARROW_GEOMETRY}
        position={[0, CAR_HEIGHT * 0.9 + 0.02, 0]}
        rotation={[0, arrowYaw, 0]}
      >
        <meshStandardMaterial color="#ffffff" roughness={0.5} side={THREE.DoubleSide} />
      </mesh>
    </group>
  )
}

export function Cars() {
  const cars = useCarStore((s) => s.cars)
  return (
    <group>
      {cars.map((car) => (
        <Car key={car.id} car={car} />
      ))}
    </group>
  )
}
