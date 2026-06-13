import { Canvas } from '@react-three/fiber'
import * as THREE from 'three'
import { COLORS } from '../config'
import { Background } from './Background'
import { Boss } from './Boss'
import { BossSlams } from './BossSlams'
import { Crowd } from './Crowd'
import { GameController } from './GameController'
import { Gates } from './Gates'
import { Particles } from './Particles'
import { Road } from './Road'

export function Scene() {
  return (
    <Canvas
      shadows
      dpr={[1, 1.8]}
      gl={{ antialias: true, powerPreference: 'high-performance' }}
      camera={{ position: [0, 6.6, 11.5], fov: 55, near: 0.1, far: 600 }}
      onCreated={({ scene }) => {
        scene.background = new THREE.Color(COLORS.sky)
        scene.fog = new THREE.Fog(COLORS.fog, 60, 230)
      }}
    >
      <hemisphereLight args={['#ffffff', '#6f9f6f', 0.9]} />
      <ambientLight intensity={0.35} />
      <directionalLight
        position={[12, 22, 10]}
        intensity={1.5}
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-camera-left={-30}
        shadow-camera-right={30}
        shadow-camera-top={30}
        shadow-camera-bottom={-30}
        shadow-camera-far={80}
      />

      <GameController />
      <Background />
      <Road />
      <Gates />
      <BossSlams />
      <Boss />
      <Crowd />
      <Particles />
    </Canvas>
  )
}
