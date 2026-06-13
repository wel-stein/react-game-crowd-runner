import { create } from 'zustand'
import { LEVELS, START_CROWD, type Difficulty } from '../config'
import { game, startRun } from './game'

export type Phase = 'start' | 'playing' | 'battle' | 'win' | 'lose'

interface GameState {
  phase: Phase
  difficulty: Difficulty
  runId: number // bumps on every (re)start so Gates remounts cleanly
  crowd: number
  popKey: number // bumps whenever the crowd count changes (drives HUD pop)
  progress: number // 0..1 distance to boss
  bossHealth: number
  bossMax: number
  result: 'win' | 'lose' | null
  finalCrowd: number

  start: (difficulty: Difficulty) => void
  restart: () => void
  toMenu: () => void
  setCrowd: (n: number) => void
  setProgress: (p: number) => void
  setBossHealth: (h: number) => void
  beginBattle: () => void
  finish: (result: 'win' | 'lose', finalCrowd: number) => void
}

export const useGameStore = create<GameState>((set, get) => {
  // Spin up a fresh run on the chosen difficulty (shared by start + restart).
  const launch = (difficulty: Difficulty) => {
    startRun(difficulty)
    set((s) => ({
      phase: 'playing',
      difficulty,
      runId: s.runId + 1,
      crowd: START_CROWD,
      popKey: 0,
      progress: 0,
      bossHealth: game.level.bossHealth,
      bossMax: game.level.bossHealth,
      result: null,
      finalCrowd: 0,
    }))
  }

  return {
    phase: 'start',
    difficulty: 'easy',
    runId: 0,
    crowd: START_CROWD,
    popKey: 0,
    progress: 0,
    bossHealth: LEVELS.easy.bossHealth,
    bossMax: LEVELS.easy.bossHealth,
    result: null,
    finalCrowd: 0,

    start: (difficulty) => launch(difficulty),
    restart: () => launch(get().difficulty),
    toMenu: () => set({ phase: 'start', result: null }),

    setCrowd: (n) => set((s) => ({ crowd: n, popKey: s.popKey + 1 })),
    setProgress: (p) => set({ progress: p }),
    setBossHealth: (h) => set({ bossHealth: h }),
    beginBattle: () => set({ phase: 'battle' }),
    finish: (result, finalCrowd) => set({ phase: result, result, finalCrowd }),
  }
})
