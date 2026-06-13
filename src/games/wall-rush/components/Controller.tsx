import { useFrame, useThree } from '@react-three/fiber'
import { useRef } from 'react'
import {
  applyCell,
  BATTLE_DURATION,
  BOSS_STOP_Z,
  cellColor,
  HUG_X,
  KEY_STEER_SPEED,
  MAX_X,
  ROW_HIT_Z,
  STEER_LERP,
  WALL_X,
} from '../config'
import { useControls } from '../hooks/useControls'
import { wgame } from '../state/runtime'
import { useWallStore } from '../state/store'
import { emitBurst } from '../utils/effects'
import { SHAKE_SCALE } from '../utils/env'
import { clamp, easeOutCubic, lerp } from '../utils/math'

// Wall Rush game loop: steering, world scroll, wall-row collection, boss clash.
export function Controller() {
  const { camera } = useThree()
  useControls()
  const battle = useRef({ startCrowd: 0, started: false, casualtyTimer: 0 })

  useFrame((_, rawDt) => {
    const dt = Math.min(rawDt, 0.05)
    const store = useWallStore.getState()
    const phase = store.phase
    if (store.paused) return

    if (phase === 'playing') {
      wgame.time += dt

      // steering
      if (wgame.keyLeft) wgame.targetX -= KEY_STEER_SPEED * dt
      if (wgame.keyRight) wgame.targetX += KEY_STEER_SPEED * dt
      wgame.targetX = clamp(wgame.targetX, -MAX_X, MAX_X)
      wgame.leaderX = lerp(wgame.leaderX, wgame.targetX, Math.min(1, dt * STEER_LERP))

      // scroll
      wgame.traveled += wgame.level.runSpeed * dt
      store.setProgress(clamp(wgame.traveled / wgame.level.bossTravel, 0, 1))

      // collect a row's wall value on whichever side the crowd is hugging
      for (const row of wgame.rows) {
        if (row.resolved) continue
        if (row.worldZ + wgame.traveled >= ROW_HIT_Z) {
          row.resolved = true
          const side = wgame.leaderX < -HUG_X ? 'left' : wgame.leaderX > HUG_X ? 'right' : null
          row.collected = side
          if (side) {
            const cell = side === 'left' ? row.left : row.right
            store.setCrowd(applyCell(store.crowd, cell))
            emitBurst(side === 'left' ? -WALL_X : WALL_X, 1, ROW_HIT_Z, cellColor(cell.kind))
            wgame.shake = Math.min(wgame.shake + (cell.kind === 'penalty' ? 0.55 : 0.16), 0.7)
          }
        }
      }

      // boss trigger
      if (wgame.level.bossWorldZ + wgame.traveled >= BOSS_STOP_Z) {
        wgame.traveled = BOSS_STOP_Z - wgame.level.bossWorldZ
        battle.current = { startCrowd: store.crowd, started: true, casualtyTimer: 0 }
        wgame.battleTime = 0
        store.beginBattle(store.crowd)
      }
    } else if (phase === 'battle') {
      wgame.time += dt
      wgame.battleTime += dt
      const t = clamp(wgame.battleTime / BATTLE_DURATION, 0, 1)
      const e = easeOutCubic(t)
      wgame.battleRush = e
      wgame.shake = 0.35 * (1 - t) + 0.12

      const start = battle.current.startCrowd
      const max = store.bossMax
      store.setBossHealth(Math.max(0, Math.round(max - start * e)))
      store.setCrowd(Math.max(0, Math.round(start - max * e)))

      battle.current.casualtyTimer -= dt
      if (battle.current.casualtyTimer <= 0) {
        battle.current.casualtyTimer = 0.08
        emitBurst((Math.random() - 0.5) * 4, 0.7, BOSS_STOP_Z + 1.2 + Math.random(), '#ffd0f4')
      }

      if (t >= 1 && battle.current.started) {
        battle.current.started = false
        const win = start >= max
        const survivors = win ? start - max : 0
        store.setCrowd(survivors)
        store.setBossHealth(win ? 0 : Math.max(0, max - start))
        emitBurst(0, 1.4, BOSS_STOP_Z, win ? '#34d36b' : '#ff4b4b')
        wgame.shake = 0.8
        store.finish(win ? 'win' : 'lose', survivors, start)
      }
    }

    // camera follow + shake
    wgame.shake *= 0.86
    const amt = wgame.shake * SHAKE_SCALE
    camera.position.x = lerp(camera.position.x, wgame.leaderX * 0.5, 0.1) + (Math.random() - 0.5) * amt
    camera.position.y = 6.6 + (Math.random() - 0.5) * amt
    camera.position.z = 11.5
    camera.lookAt(wgame.leaderX * 0.25, 1.1, -7)
  })

  return null
}
