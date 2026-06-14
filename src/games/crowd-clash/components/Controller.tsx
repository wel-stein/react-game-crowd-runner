import { useFrame, useThree } from '@react-three/fiber'
import { useRef } from 'react'
import {
  applyOp,
  BATTLE_DURATION,
  CLASH_Z,
  GATE_HIT_Z,
  KEY_STEER_SPEED,
  MAX_X,
  opColor,
  RIVAL_X,
  RIVAL_Z,
  STEER_LERP,
} from '../config'
import { useControls } from '../hooks/useControls'
import { ccgame } from '../state/runtime'
import { useClashStore } from '../state/store'
import { emitBurst } from '../utils/effects'
import { SHAKE_SCALE } from '../utils/env'
import { clamp, easeOutCubic, lerp } from '../utils/math'

// Crowd Clash loop: you steer through gates; the rival AI takes a gate too,
// sized against its own crowd. At the end both armies converge and clash.
export function Controller() {
  const { camera } = useThree()
  useControls()
  const battle = useRef({ you: 0, rival: 0, started: false, casualtyTimer: 0 })

  useFrame((_, rawDt) => {
    const dt = Math.min(rawDt, 0.05)
    const store = useClashStore.getState()
    const phase = store.phase
    if (store.paused) return

    if (phase === 'playing') {
      ccgame.time += dt

      if (ccgame.keyLeft) ccgame.targetX -= KEY_STEER_SPEED * dt
      if (ccgame.keyRight) ccgame.targetX += KEY_STEER_SPEED * dt
      ccgame.targetX = clamp(ccgame.targetX, -MAX_X, MAX_X)
      ccgame.leaderX = lerp(ccgame.leaderX, ccgame.targetX, Math.min(1, dt * STEER_LERP))

      ccgame.traveled += ccgame.level.runSpeed * dt
      store.setProgress(clamp(ccgame.traveled / ccgame.level.clashTravel, 0, 1))

      for (const section of ccgame.sections) {
        if (section.resolved) continue
        if (section.worldZ + ccgame.traveled >= GATE_HIT_Z) {
          section.resolved = true

          // you: gate on your lane
          const youSide = ccgame.leaderX < 0 ? 'left' : 'right'
          section.youChose = youSide
          const youOp = youSide === 'left' ? section.left : section.right
          store.setCrowd(applyOp(store.crowd, youOp))
          emitBurst(youSide === 'left' ? -2.5 : 2.5, 1.1, GATE_HIT_Z, opColor(youOp.kind))

          // rival: AI picks its better gate with probability rivalSkill
          const r = store.rival
          const bestSide = applyOp(r, section.left) >= applyOp(r, section.right) ? 'left' : 'right'
          const pick = Math.random() < ccgame.level.rivalSkill ? bestSide : bestSide === 'left' ? 'right' : 'left'
          section.rivalChose = pick
          const rivalOp = pick === 'left' ? section.left : section.right
          store.setRival(applyOp(r, rivalOp))
          emitBurst(RIVAL_X, 1.0, RIVAL_Z, opColor(rivalOp.kind))

          ccgame.shake = Math.min(ccgame.shake + 0.22, 0.6)
        }
      }

      if (ccgame.level.clashWorldZ + ccgame.traveled >= CLASH_Z) {
        ccgame.traveled = CLASH_Z - ccgame.level.clashWorldZ
        battle.current = { you: store.crowd, rival: store.rival, started: true, casualtyTimer: 0 }
        ccgame.battleTime = 0
        store.beginBattle(store.crowd, store.rival)
      }
    } else if (phase === 'battle') {
      ccgame.time += dt
      ccgame.battleTime += dt
      const t = clamp(ccgame.battleTime / BATTLE_DURATION, 0, 1)
      const e = easeOutCubic(t)
      ccgame.battleRush = e
      ccgame.shake = 0.35 * (1 - t) + 0.12

      const { you, rival } = battle.current
      const dmg = Math.min(you, rival) * e
      store.setCrowd(Math.max(0, Math.round(you - dmg)))
      store.setRival(Math.max(0, Math.round(rival - dmg)))

      battle.current.casualtyTimer -= dt
      if (battle.current.casualtyTimer <= 0) {
        battle.current.casualtyTimer = 0.07
        emitBurst((Math.random() - 0.5) * 4, 0.7, CLASH_Z + 0.5, '#ffe1a8')
      }

      if (t >= 1 && battle.current.started) {
        battle.current.started = false
        const win = you >= rival
        const survivors = win ? you - rival : 0
        store.setCrowd(survivors)
        store.setRival(win ? 0 : rival - you)
        emitBurst(0, 1.4, CLASH_Z, win ? '#34d36b' : '#ff5563')
        ccgame.shake = 0.8
        store.finish(win ? 'win' : 'lose', survivors, you, rival)
      }
    }

    ccgame.shake *= 0.86
    const amt = ccgame.shake * SHAKE_SCALE
    camera.position.x = lerp(camera.position.x, ccgame.leaderX * 0.4, 0.1) + (Math.random() - 0.5) * amt
    camera.position.y = 6.6 + (Math.random() - 0.5) * amt
    camera.position.z = 11.5
    camera.lookAt(ccgame.leaderX * 0.2, 1.1, -7)
  })

  return null
}
