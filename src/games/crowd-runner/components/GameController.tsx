import { useFrame, useThree } from '@react-three/fiber'
import { useRef } from 'react'
import {
  applyOp,
  BATTLE_DURATION,
  BOSS_STOP_Z,
  GATE_HIT_Z,
  KEY_STEER_SPEED,
  MAX_X,
  opColor,
  SLAM_CULL,
  SLAM_TELEGRAPH,
  STEER_LERP,
} from '../config'
import { useControls } from '../hooks/useControls'
import { game } from '../state/game'
import { useGameStore } from '../state/store'
import { emitBurst } from '../utils/effects'
import { SHAKE_SCALE } from '../utils/env'
import { clamp, easeOutCubic, lerp } from '../utils/math'

// Owns the whole game loop: steering, world scroll, gate resolution, boss
// trigger and the final battle. Reads input from the live `game` runtime and
// pushes player-facing state into the zustand store.
export function GameController() {
  const { camera } = useThree()
  useControls()

  const battleData = useRef({ startCrowd: 0, started: false, casualtyTimer: 0 })

  useFrame((_, rawDt) => {
    const dt = Math.min(rawDt, 0.05)
    const store = useGameStore.getState()
    const phase = store.phase

    if (store.paused) return // freeze the world while paused

    if (phase === 'playing') {
      game.time += dt

      // --- steering ---------------------------------------------------------
      if (game.keyLeft) game.targetX -= KEY_STEER_SPEED * dt
      if (game.keyRight) game.targetX += KEY_STEER_SPEED * dt
      game.targetX = clamp(game.targetX, -MAX_X, MAX_X)
      game.leaderX = lerp(game.leaderX, game.targetX, Math.min(1, dt * STEER_LERP))

      // --- world scroll -----------------------------------------------------
      game.traveled += game.level.runSpeed * dt
      store.setProgress(clamp(game.traveled / game.level.bossTravel, 0, 1))

      // --- gate resolution --------------------------------------------------
      for (const section of game.sections) {
        if (section.resolved) continue
        const renderZ = section.worldZ + game.traveled
        if (renderZ >= GATE_HIT_Z) {
          const chosen = game.leaderX < 0 ? 'left' : 'right'
          section.chosen = chosen
          section.resolved = true
          const op = chosen === 'left' ? section.left : section.right
          const next = applyOp(store.crowd, op)
          store.setCrowd(next)
          game.shake = Math.min(game.shake + 0.25, 0.6)
          const gx = chosen === 'left' ? -2.4 : 2.4
          emitBurst(gx, 1.1, GATE_HIT_Z, opColor(op.kind))
        }
      }

      // --- boss slams -------------------------------------------------------
      // During the final approach the boss telegraphs a slam on one half of the
      // road; if the crowd is on that side (or dithering in the middle) when it
      // lands, a chunk of runners is culled. Steer to the safe side to dodge.
      const progress = game.traveled / game.level.bossTravel
      for (const slam of game.slams) {
        if (slam.resolved) continue
        if (slam.warnStart === null) {
          if (progress >= slam.at) slam.warnStart = game.time
        } else if (game.time - slam.warnStart >= SLAM_TELEGRAPH) {
          slam.resolved = true
          const caught = Math.sign(game.leaderX) === slam.side || Math.abs(game.leaderX) < 0.6
          if (caught) {
            store.setCrowd(Math.max(0, Math.round(store.crowd * (1 - SLAM_CULL))))
            emitBurst(slam.side * 2.4, 0.6, GATE_HIT_Z, '#ff5563')
            game.shake = Math.min(game.shake + 0.6, 0.9)
          }
        }
      }

      // --- boss trigger -----------------------------------------------------
      const bossRenderZ = game.level.bossWorldZ + game.traveled
      if (bossRenderZ >= BOSS_STOP_Z) {
        game.traveled = BOSS_STOP_Z - game.level.bossWorldZ // freeze the world
        battleData.current = { startCrowd: store.crowd, started: true, casualtyTimer: 0 }
        game.battleTime = 0
        store.beginBattle(store.crowd)
      }
    } else if (phase === 'battle') {
      game.time += dt
      game.battleTime += dt
      const t = clamp(game.battleTime / BATTLE_DURATION, 0, 1)
      const e = easeOutCubic(t)
      game.battleRush = e
      game.shake = 0.35 * (1 - t) + 0.12

      const start = battleData.current.startCrowd
      const max = store.bossMax
      // boss health and crowd both tick down for drama — the runners take heavy
      // casualties as they smash into the boss
      store.setBossHealth(Math.max(0, Math.round(max - start * e)))
      store.setCrowd(Math.max(0, Math.round(start - max * e)))

      // spray "poof" bursts at the front line as runners fall, so the shrinking
      // crowd reads as losses in the fight
      battleData.current.casualtyTimer -= dt
      if (battleData.current.casualtyTimer <= 0) {
        battleData.current.casualtyTimer = 0.08
        const px = (Math.random() - 0.5) * 4
        emitBurst(px, 0.7, BOSS_STOP_Z + 1.2 + Math.random(), '#e8eef5')
      }

      if (t >= 1 && battleData.current.started) {
        battleData.current.started = false
        const win = start >= max
        const survivors = win ? start - max : 0
        store.setCrowd(survivors)
        store.setBossHealth(win ? 0 : Math.max(0, max - start))
        emitBurst(0, 1.4, BOSS_STOP_Z, win ? '#34d36b' : '#ff5563')
        game.shake = 0.8
        store.finish(win ? 'win' : 'lose', survivors, start)
      }
    }

    // --- camera (follow + shake) -------------------------------------------
    game.shake *= 0.86
    const shakeAmt = game.shake * SHAKE_SCALE
    const sx = (Math.random() - 0.5) * shakeAmt
    const sy = (Math.random() - 0.5) * shakeAmt
    camera.position.x = lerp(camera.position.x, game.leaderX * 0.5, 0.1) + sx
    camera.position.y = 6.6 + sy
    camera.position.z = 11.5
    camera.lookAt(game.leaderX * 0.25, 1.1, -7)
  })

  return null
}
