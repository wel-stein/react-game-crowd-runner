import { Html } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { useRef } from 'react'
import * as THREE from 'three'
import { opColor, opLabel, ROAD_WIDTH, type Operation } from '../config'
import { ccgame, type LiveSection } from '../state/runtime'
import { useClashStore } from '../state/store'

const GATE_W = ROAD_WIDTH / 2 - 0.15
const GATE_H = 3.2
const GATE_X = ROAD_WIDTH / 4

function GatePanel({ op, x, showLabel }: { op: Operation; x: number; showLabel: boolean }) {
  const color = opColor(op.kind)
  return (
    <group position={[x, GATE_H / 2, 0]}>
      <mesh>
        <planeGeometry args={[GATE_W, GATE_H]} />
        <meshStandardMaterial
          color={color}
          transparent
          opacity={0.4}
          side={THREE.DoubleSide}
          emissive={color}
          emissiveIntensity={0.35}
          depthWrite={false}
        />
      </mesh>
      <mesh position={[-GATE_W / 2, 0, 0]}>
        <boxGeometry args={[0.18, GATE_H + 0.4, 0.18]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.4} />
      </mesh>
      <mesh position={[GATE_W / 2, 0, 0]}>
        <boxGeometry args={[0.18, GATE_H + 0.4, 0.18]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.4} />
      </mesh>
      <mesh position={[0, GATE_H / 2 + 0.1, 0]}>
        <boxGeometry args={[GATE_W + 0.2, 0.22, 0.18]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.4} />
      </mesh>
      {showLabel && (
        <Html center position={[0, 0.2, 0.05]} distanceFactor={11} style={{ pointerEvents: 'none' }}>
          <div className="cc-gate">{opLabel(op)}</div>
        </Html>
      )}
    </group>
  )
}

function Section({ section, showLabels }: { section: LiveSection; showLabels: boolean }) {
  const ref = useRef<THREE.Group>(null!)
  const leftRef = useRef<THREE.Group>(null!)
  const rightRef = useRef<THREE.Group>(null!)

  useFrame(() => {
    if (!ref.current) return
    const z = section.worldZ + ccgame.traveled
    ref.current.position.z = z
    const visible = z > -120 && z < 18
    ref.current.visible = visible
    if (!visible) return
    if (section.resolved && section.youChose) {
      const chosen = section.youChose === 'left' ? leftRef : rightRef
      const other = section.youChose === 'left' ? rightRef : leftRef
      chosen.current?.scale.lerp(BURST, 0.25)
      other.current?.scale.lerp(HIDE, 0.2)
    } else {
      leftRef.current?.scale.lerp(ONE, 0.3)
      rightRef.current?.scale.lerp(ONE, 0.3)
    }
  })

  return (
    <group ref={ref}>
      <group ref={leftRef}>
        <GatePanel op={section.left} x={-GATE_X} showLabel={showLabels} />
      </group>
      <group ref={rightRef}>
        <GatePanel op={section.right} x={GATE_X} showLabel={showLabels} />
      </group>
    </group>
  )
}

const BURST = new THREE.Vector3(1.12, 1.12, 1.12)
const HIDE = new THREE.Vector3(0.85, 0.85, 0.85)
const ONE = new THREE.Vector3(1, 1, 1)

export function Gates() {
  const runId = useClashStore((s) => s.runId)
  const phase = useClashStore((s) => s.phase)
  const showLabels = phase === 'playing' || phase === 'battle'
  return (
    <group key={runId}>
      {ccgame.sections.map((s, i) => (
        <Section key={i} section={s} showLabels={showLabels} />
      ))}
    </group>
  )
}
