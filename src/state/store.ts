import { create } from 'zustand'
import { LEVELS, START_CROWD, type Difficulty } from '../config'
import { game, startRun } from './game'

export type Phase = 'start' | 'playing' | 'battle' | 'win' | 'lose'

const HS_KEY = 'crowdrunner.highscores.v1'

type HighScores = Record<Difficulty, number>

function loadHighScores(): HighScores {
  const empty: HighScores = { easy: 0, medium: 0, hard: 0 }
  try {
    const raw = localStorage.getItem(HS_KEY)
    if (!raw) return empty
    return { ...empty, ...JSON.parse(raw) }
  } catch {
    return empty
  }
}

function saveHighScores(hs: HighScores): void {
  try {
    localStorage.setItem(HS_KEY, JSON.stringify(hs))
  } catch {
    /* ignore quota / privacy-mode errors */
  }
}

interface GameState {
  phase: Phase
  difficulty: Difficulty
  runId: number // bumps on every (re)start so Gates remounts cleanly
  crowd: number
  popKey: number // bumps whenever the crowd count changes (drives HUD pop)
  progress: number // 0..1 distance to boss
  bossHealth: number
  bossMax: number
  clashCrowd: number // crowd size at the moment the battle starts
  paused: boolean
  result: 'win' | 'lose' | null
  finalCrowd: number
  score: number
  stars: number // 0..3 on a win
  highScores: HighScores
  isNewHigh: boolean

  start: (difficulty: Difficulty) => void
  restart: () => void
  toMenu: () => void
  togglePause: () => void
  setCrowd: (n: number) => void
  setProgress: (p: number) => void
  setBossHealth: (h: number) => void
  beginBattle: (clashCrowd: number) => void
  finish: (result: 'win' | 'lose', finalCrowd: number, clashCrowd: number) => void
}

export const useGameStore = create<GameState>((set, get) => {
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
      clashCrowd: 0,
      paused: false,
      result: null,
      finalCrowd: 0,
      score: 0,
      stars: 0,
      isNewHigh: false,
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
    clashCrowd: 0,
    paused: false,
    result: null,
    finalCrowd: 0,
    score: 0,
    stars: 0,
    highScores: loadHighScores(),
    isNewHigh: false,

    start: (difficulty) => launch(difficulty),
    restart: () => launch(get().difficulty),
    toMenu: () => set({ phase: 'start', result: null, paused: false }),
    togglePause: () => {
      const { phase, paused } = get()
      if (phase === 'playing' || phase === 'battle') set({ paused: !paused })
    },

    setCrowd: (n) => set((s) => ({ crowd: n, popKey: s.popKey + 1 })),
    setProgress: (p) => set({ progress: p }),
    setBossHealth: (h) => set({ bossHealth: h }),
    beginBattle: (clashCrowd) => set({ phase: 'battle', clashCrowd }),

    finish: (result, finalCrowd, clashCrowd) => {
      const { bossMax, difficulty, highScores } = get()
      const win = result === 'win'
      const mult = LEVELS[difficulty].scoreMult
      const score = Math.round((clashCrowd + (win ? bossMax : 0)) * mult)
      // stars from how decisively the boss was beaten (win only)
      let stars = 0
      if (win) {
        const ratio = clashCrowd / bossMax
        stars = ratio >= 2.5 ? 3 : ratio >= 1.6 ? 2 : 1
      }
      const prevBest = highScores[difficulty] ?? 0
      const isNewHigh = score > prevBest
      const nextHS = isNewHigh ? { ...highScores, [difficulty]: score } : highScores
      if (isNewHigh) saveHighScores(nextHS)
      set({
        phase: result,
        result,
        finalCrowd,
        score,
        stars,
        highScores: nextHS,
        isNewHigh,
        paused: false,
      })
    },
  }
})
