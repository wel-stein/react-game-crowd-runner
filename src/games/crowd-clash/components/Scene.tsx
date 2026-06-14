import { Canvas } from '@react-three/fiber'
import * as THREE from 'three'
import { CLASH_Z, COLORS, RIVAL_HUE, RIVAL_X, RIVAL_Z, YOU_HUE } from '../config'
import { ccgame } from '../state/runtime'
import { useClashStore } from '../state/store'
import { lerp } from '../utils/math'
import { Background } from './Background'
import { Controller } from './Controller'
import { Crowd } from './Crowd'
import { Gates } from './Gates'
import { Particles } from './Particles'
import { Road } from './Road'

const youCenter = (): [number, number] => {
  const r = ccgame.battleRush
  return [lerp(ccgame.leaderX, 0, r), lerp(0, CLASH_Z + 0.9, r)]
}
const rivalCenter = (): [number, number] => {
  const r = ccgame.battleRush
  return [lerp(RIVAL_X, 0, r), lerp(RIVAL_Z, CLASH_Z - 0.9, r)]
}

export function Scene() {
  const crowd = useClashStore((s) => s.crowd)
  const rival = useClashStore((s) => s.rival)
  const phase = useClashStore((s) => s.phase)
  const showLabel = phase === 'playing' || phase === 'battle'

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

      <Controller />
      <Background />
      <Road />
      <Gates />
      <Crowd
        count={rival}
        hue={RIVAL_HUE}
        getCenter={rivalCenter}
        label={showLabel ? rival : undefined}
        labelClass="cc-rival-label"
      />
      <Crowd count={crowd} hue={YOU_HUE} getCenter={youCenter} />
      <Particles />
    </Canvas>
  )
}
