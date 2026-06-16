import { create } from 'zustand'
import { LEVELS, type Difficulty } from '../config'
import { generateLevel } from '../utils/generate'
import { pathClear, type Car } from '../utils/grid'

export type Phase = 'start' | 'playing' | 'win' | 'lose'

const HS_KEY = 'carjam.highscores.v1'
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
  cols: number
  rows: number
  cars: Car[]
  carsLeft: number
  taps: number // taps spent so far
  budget: number // total taps allowed
  bump: { id: number; key: number } | null // signals a blocked car to shake
  paused: boolean
  result: 'win' | 'lose' | null
  score: number
  stars: number
  highScores: HighScores
  isNewHigh: boolean

  start: (d: Difficulty) => void
  restart: () => void
  toMenu: () => void
  togglePause: () => void
  tapCar: (id: number) => void
  removeCar: (id: number) => void
}

export const useCarStore = create<State>((set, get) => {
  const launch = (difficulty: Difficulty) => {
    const lvl = LEVELS[difficulty]
    const cars = generateLevel(lvl)
    set((s) => ({
      phase: 'playing',
      difficulty,
      runId: s.runId + 1,
      cols: lvl.cols,
      rows: lvl.rows,
      cars,
      carsLeft: cars.length,
      taps: 0,
      budget: cars.length + lvl.extraTaps,
      bump: null,
      paused: false,
      result: null,
      score: 0,
      stars: 0,
      isNewHigh: false,
    }))
  }

  const settle = (win: boolean) => {
    const { difficulty, taps, budget, cars, highScores } = get()
    const lvl = LEVELS[difficulty]
    const carCount = cars.length
    const extra = Math.max(0, taps - carCount) // wasted (blocked) taps
    let stars = 0
    if (win) {
      stars = extra === 0 ? 3 : extra <= Math.ceil(lvl.extraTaps / 2) ? 2 : 1
    }
    const tapsBank = Math.max(0, budget - taps)
    const score = win
      ? Math.round((carCount * 100 + tapsBank * 60 + stars * 150) * lvl.scoreMult)
      : 0
    const isNewHigh = win && score > (highScores[difficulty] ?? 0)
    const nextHS = isNewHigh ? { ...highScores, [difficulty]: score } : highScores
    if (isNewHigh) saveHighScores(nextHS)
    set({
      phase: win ? 'win' : 'lose',
      result: win ? 'win' : 'lose',
      score,
      stars,
      highScores: nextHS,
      isNewHigh,
      paused: false,
    })
  }

  return {
    phase: 'start',
    difficulty: 'easy',
    runId: 0,
    cols: LEVELS.easy.cols,
    rows: LEVELS.easy.rows,
    cars: [],
    carsLeft: 0,
    taps: 0,
    budget: 0,
    bump: null,
    paused: false,
    result: null,
    score: 0,
    stars: 0,
    highScores: loadHighScores(),
    isNewHigh: false,

    start: (d) => launch(d),
    restart: () => launch(get().difficulty),
    toMenu: () => set({ phase: 'start', result: null, paused: false }),
    togglePause: () => {
      const { phase, paused } = get()
      if (phase === 'playing') set({ paused: !paused })
    },

    tapCar: (id) => {
      const { phase, paused, cars, cols, rows, taps, budget } = get()
      if (phase !== 'playing' || paused) return
      const car = cars.find((c) => c.id === id)
      if (!car || car.status !== 'parked') return
      if (taps >= budget) return

      const nextTaps = taps + 1
      const clear = pathClear(car, cars, cols, rows)

      if (clear) {
        const cars2 = cars.map((c) => (c.id === id ? { ...c, status: 'leaving' as const } : c))
        const carsLeft = get().carsLeft - 1
        set({ cars: cars2, carsLeft, taps: nextTaps })
        if (carsLeft <= 0) settle(true)
      } else {
        // blocked: costs a tap and bumps the car
        set((s) => ({ taps: nextTaps, bump: { id, key: (s.bump?.key ?? 0) + 1 } }))
        if (nextTaps >= budget && get().carsLeft > 0) settle(false)
      }
    },

    // called when a leaving car's drive-off animation finishes
    removeCar: (id) => {
      set((s) => ({
        cars: s.cars.map((c) => (c.id === id ? { ...c, status: 'gone' as const } : c)),
      }))
    },
  }
})
