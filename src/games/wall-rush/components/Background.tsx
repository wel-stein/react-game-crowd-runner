import { useMemo } from 'react'
import { COLORS } from '../config'
import { hash } from '../utils/math'

// Foggy green hills + grass ground.
export function Background() {
  const hills = useMemo(() => {
    const arr: { x: number; z: number; s: number; shade: number }[] = []
    for (let i = 0; i < 26; i++) {
      const side = i % 2 === 0 ? -1 : 1
      const z = -40 - (i / 26) * 320
      const x = side * (11 + hash(i * 2.1) * 26)
      const s = 8 + hash(i * 4.3) * 16
      arr.push({ x, z, s, shade: 0.32 + hash(i * 7.7) * 0.25 })
    }
    return arr
  }, [])

  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, -120]} receiveShadow>
        <planeGeometry args={[800, 800]} />
        <meshStandardMaterial color={COLORS.grass} roughness={1} />
      </mesh>
      {hills.map((h, i) => (
        <mesh key={i} position={[h.x, h.s * 0.35 - 1, h.z]}>
          <sphereGeometry args={[h.s, 10, 8]} />
          <meshStandardMaterial color={`hsl(115, 45%, ${h.shade * 100}%)`} roughness={1} />
        </mesh>
      ))}
    </group>
  )
}
