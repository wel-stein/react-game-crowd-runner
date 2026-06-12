import { useFrame } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import * as THREE from 'three'
import { COLORS, ROAD_WIDTH } from '../config'
import { game } from '../state/game'

const ROAD_LENGTH = 400
const SEGMENT = 8 // world length represented by one texture tile

// Builds a canvas texture with side lines + dashed center markings, then scrolls
// its offset by `traveled` so the road appears to rush toward the player.
function makeRoadTexture(): THREE.Texture {
  const c = document.createElement('canvas')
  c.width = 128
  c.height = 256
  const ctx = c.getContext('2d')!
  ctx.fillStyle = COLORS.road
  ctx.fillRect(0, 0, c.width, c.height)
  // edge lines
  ctx.fillStyle = '#f3f4f7'
  ctx.fillRect(8, 0, 8, c.height)
  ctx.fillRect(c.width - 16, 0, 8, c.height)
  // dashed center line
  ctx.fillStyle = '#ffe27a'
  const dash = c.height / 4
  for (let i = 0; i < 4; i += 2) {
    ctx.fillRect(c.width / 2 - 4, i * dash, 8, dash * 0.6)
  }
  const tex = new THREE.CanvasTexture(c)
  tex.wrapS = THREE.RepeatWrapping
  tex.wrapT = THREE.RepeatWrapping
  tex.repeat.set(1, ROAD_LENGTH / SEGMENT)
  tex.anisotropy = 4
  return tex
}

export function Road() {
  const tex = useMemo(makeRoadTexture, [])
  const matRef = useRef<THREE.MeshStandardMaterial>(null!)

  useFrame(() => {
    tex.offset.y = -game.traveled / SEGMENT
  })

  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, -ROAD_LENGTH / 2 + 40]} receiveShadow>
      <planeGeometry args={[ROAD_WIDTH, ROAD_LENGTH]} />
      <meshStandardMaterial ref={matRef} map={tex} roughness={0.95} />
    </mesh>
  )
}
