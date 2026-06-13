import { create } from 'zustand'
import { LEVELS, START_CROWD, type Difficulty } from '../config'
import { startRun, wgame } from './runtime'

export type Phase = 'start' | 'playing' | 'battle' | 'win' | 'lose'

const HS_KEY = 'wallrush.highscores.v1'
type HighScores = Record<Difficulty, number>

function loadHighScores(): HighScores {
  const empty: HighScores = { easy: 0, medium: 0, hard: 0 }
  try {
    const raw = localStorage.getItem(HS_KEY)
    return raw ? { ...empty, ...JSON.parse(raw) } : empty
  } catch {
    return empty
  }
}
function saveHighScores(hs: HighScores): void {
  try {
    localStorage.setItem(HS_KEY, JSON.stringify(hs))
  } catch {
    /* ignore */
  }
}

interface State {
  phase: Phase
  difficulty: Difficulty
  runId: number
  crowd: number
  popKey: number
  progress: number
  bossHealth: number
  bossMax: number
  clashCrowd: number
  paused: boolean
  result: 'win' | 'lose' | null
  finalCrowd: number
  score: number
  stars: number
  highScores: HighScores
  isNewHigh: boolean

  start: (d: Difficulty) => void
  restart: () => void
  toMenu: () => void
  togglePause: () => void
  setCrowd: (n: number) => void
  setProgress: (p: number) => void
  setBossHealth: (h: number) => void
  beginBattle: (clashCrowd: number) => void
  finish: (result: 'win' | 'lose', finalCrowd: number, clashCrowd: number) => void
}

export const useWallStore = create<State>((set, get) => {
  const launch = (difficulty: Difficulty) => {
    startRun(difficulty)
    set((s) => ({
      phase: 'playing',
      difficulty,
      runId: s.runId + 1,
      crowd: START_CROWD,
      popKey: 0,
      progress: 0,
      bossHealth: wgame.level.bossHealth,
      bossMax: wgame.level.bossHealth,
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

    start: (d) => launch(d),
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
      let stars = 0
      if (win) {
        const ratio = clashCrowd / bossMax
        stars = ratio >= 2.5 ? 3 : ratio >= 1.6 ? 2 : 1
      }
      const isNewHigh = score > (highScores[difficulty] ?? 0)
      const nextHS = isNewHigh ? { ...highScores, [difficulty]: score } : highScores
      if (isNewHigh) saveHighScores(nextHS)
      set({ phase: result, result, finalCrowd, score, stars, highScores: nextHS, isNewHigh, paused: false })
    },
  }
})
