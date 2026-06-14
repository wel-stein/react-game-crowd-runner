import { create } from 'zustand'
import { START_CROWD, type Difficulty } from '../config'
import { startRun } from './runtime'

export type Phase = 'start' | 'playing' | 'battle' | 'win' | 'lose'

const HS_KEY = 'crowdclash.highscores.v1'
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
  crowd: number // you
  rival: number // them
  popKey: number
  progress: number
  clashYou: number
  clashRival: number
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
  setRival: (n: number) => void
  setProgress: (p: number) => void
  beginBattle: (you: number, rival: number) => void
  finish: (result: 'win' | 'lose', finalCrowd: number, you: number, rival: number) => void
}

export const useClashStore = create<State>((set, get) => {
  const launch = (difficulty: Difficulty) => {
    startRun(difficulty)
    set((s) => ({
      phase: 'playing',
      difficulty,
      runId: s.runId + 1,
      crowd: START_CROWD,
      rival: START_CROWD,
      popKey: 0,
      progress: 0,
      clashYou: 0,
      clashRival: 0,
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
    rival: START_CROWD,
    popKey: 0,
    progress: 0,
    clashYou: 0,
    clashRival: 0,
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
    setRival: (n) => set({ rival: n }),
    setProgress: (p) => set({ progress: p }),
    beginBattle: (you, rival) => set({ phase: 'battle', clashYou: you, clashRival: rival }),
    finish: (result, finalCrowd, you, rival) => {
      const { difficulty, highScores } = get()
      const win = result === 'win'
      const mult = LEVEL_MULT[difficulty]
      const score = Math.round((you + (win ? rival : 0)) * mult)
      let stars = 0
      if (win) {
        const ratio = rival > 0 ? you / rival : 3
        stars = ratio >= 2.5 ? 3 : ratio >= 1.5 ? 2 : 1
      }
      const isNewHigh = score > (highScores[difficulty] ?? 0)
      const nextHS = isNewHigh ? { ...highScores, [difficulty]: score } : highScores
      if (isNewHigh) saveHighScores(nextHS)
      set({ phase: result, result, finalCrowd, score, stars, highScores: nextHS, isNewHigh, paused: false })
    },
  }
})

const LEVEL_MULT: Record<Difficulty, number> = { easy: 1, medium: 1.6, hard: 2.6 }
