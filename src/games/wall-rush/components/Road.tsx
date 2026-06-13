import { useFrame } from '@react-three/fiber'
import { useMemo } from 'react'
import * as THREE from 'three'
import { COLORS, ROAD_WIDTH } from '../config'
import { wgame } from '../state/runtime'

const ROAD_LENGTH = 400
const SEGMENT = 8

function makeRoadTexture(): THREE.Texture {
  const c = document.createElement('canvas')
  c.width = 128
  c.height = 256
  const ctx = c.getContext('2d')!
  ctx.fillStyle = COLORS.road
  ctx.fillRect(0, 0, c.width, c.height)
  // subtle lane shading down the middle
  ctx.fillStyle = '#c7ccd6'
  ctx.fillRect(c.width / 2 - 2, 0, 4, c.height)
  const tex = new THREE.CanvasTexture(c)
  tex.wrapS = THREE.RepeatWrapping
  tex.wrapT = THREE.RepeatWrapping
  tex.repeat.set(1, ROAD_LENGTH / SEGMENT)
  return tex
}

export function Road() {
  const tex = useMemo(makeRoadTexture, [])
  useFrame(() => {
    tex.offset.y = -wgame.traveled / SEGMENT
  })
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, -ROAD_LENGTH / 2 + 40]} receiveShadow>
      <planeGeometry args={[ROAD_WIDTH, ROAD_LENGTH]} />
      <meshStandardMaterial map={tex} roughness={0.95} />
    </mesh>
  )
}
