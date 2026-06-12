import { create } from 'zustand'
import { BOSS_HEALTH, START_CROWD } from '../config'
import { resetRuntime } from './game'

export type Phase = 'start' | 'playing' | 'battle' | 'win' | 'lose'

interface GameState {
  phase: Phase
  crowd: number
  popKey: number // bumps whenever the crowd count changes (drives HUD pop)
  progress: number // 0..1 distance to boss
  bossHealth: number
  bossMax: number
  result: 'win' | 'lose' | null
  finalCrowd: number

  start: () => void
  restart: () => void
  setCrowd: (n: number) => void
  setProgress: (p: number) => void
  setBossHealth: (h: number) => void
  beginBattle: () => void
  finish: (result: 'win' | 'lose', finalCrowd: number) => void
}

export const useGameStore = create<GameState>((set) => ({
  phase: 'start',
  crowd: START_CROWD,
  popKey: 0,
  progress: 0,
  bossHealth: BOSS_HEALTH,
  bossMax: BOSS_HEALTH,
  result: null,
  finalCrowd: 0,

  start: () => {
    resetRuntime()
    set({
      phase: 'playing',
      crowd: START_CROWD,
      popKey: 0,
      progress: 0,
      bossHealth: BOSS_HEALTH,
      bossMax: BOSS_HEALTH,
      result: null,
      finalCrowd: 0,
    })
  },

  restart: () => {
    resetRuntime()
    set({
      phase: 'playing',
      crowd: START_CROWD,
      popKey: 0,
      progress: 0,
      bossHealth: BOSS_HEALTH,
      bossMax: BOSS_HEALTH,
      result: null,
      finalCrowd: 0,
    })
  },

  setCrowd: (n) => set((s) => ({ crowd: n, popKey: s.popKey + 1 })),
  setProgress: (p) => set({ progress: p }),
  setBossHealth: (h) => set({ bossHealth: h }),
  beginBattle: () => set({ phase: 'battle' }),
  finish: (result, finalCrowd) =>
    set({ phase: result, result, finalCrowd }),
}))
