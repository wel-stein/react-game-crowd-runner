import { Canvas } from '@react-three/fiber'
import * as THREE from 'three'
import { COLORS } from '../config'
import { CameraRig } from './CameraRig'
import { Cars } from './Cars'
import { Lot } from './Lot'

export function Scene() {
  return (
    <Canvas
      shadows
      dpr={[1, 1.8]}
      gl={{ antialias: true, powerPreference: 'high-performance' }}
      camera={{ position: [0, 12, 10], fov: 45, near: 0.1, far: 200 }}
      onCreated={({ scene }) => {
        scene.background = new THREE.Color(COLORS.sky)
        scene.fog = new THREE.Fog(COLORS.fog, 30, 90)
      }}
    >
      <hemisphereLight args={['#ffffff', '#9fb2c8', 0.85]} />
      <ambientLight intensity={0.4} />
      <directionalLight
        position={[8, 16, 6]}
        intensity={1.5}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-12}
        shadow-camera-right={12}
        shadow-camera-top={12}
        shadow-camera-bottom={-12}
        shadow-camera-far={50}
      />

      <CameraRig />
      <Lot />
      <Cars />
    </Canvas>
  )
}
