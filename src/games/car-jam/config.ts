// ---------------------------------------------------------------------------
// Car Jam tuning. Self-contained — shares nothing with other games.
//
// Mechanic: a parking lot is packed with cars, each facing a direction (the
// arrow on its roof). Tap a car to drive it straight off the lot in its
// facing direction — but it can only leave if no other car blocks the lane
// between it and the edge. Clear every car off the lot before your taps run
// out. The puzzle is the *order*: free the blockers first.
// ---------------------------------------------------------------------------

export type Orient = 'h' | 'v'
export type Dir = readonly [number, number] // unit vector along the car's axis

// world: one grid cell == CELL_SIZE world units
export const CELL_SIZE = 1
export const CAR_GAP = 0.16 // shrink each car a touch so neighbours read apart
export const CAR_WIDTH = 0.82 // across the car's short axis (in cell units)
export const CAR_HEIGHT = 0.42
export const LOT_TOP = 0.12 // y of the asphalt surface cars sit on

// animation
export const LEAVE_TIME = 0.5 // seconds for a freed car to drive off the lot
export const BUMP_TIME = 0.32 // seconds a blocked car shakes in place

// a roomy palette so neighbouring cars rarely share a colour
export const CAR_COLORS = [
  '#ff7a3a', // orange (the reference's dominant colour)
  '#3aa0ff', // blue
  '#41c98a', // green
  '#ffd23a', // yellow
  '#ff5d8f', // pink
  '#9b6bff', // purple
  '#ff4b4b', // red
  '#27d4d4', // teal
  '#c0d020', // lime
  '#ff9f1c', // amber
]

export const COLORS = {
  sky: '#bfe6ff',
  fog: '#cfe9ff',
  lot: '#5b6577', // asphalt
  lotLine: '#fbe089', // painted parking lines
  curb: '#e7edf5',
}

// --- difficulty levels ------------------------------------------------------
export type Difficulty = 'easy' | 'medium' | 'hard'

export interface LevelConfig {
  id: Difficulty
  label: string
  blurb: string
  cols: number
  rows: number
  cars: number // target number of cars to pack in
  maxLen: number // longest car (cells); most cars are length 2
  longChance: number // chance a car is longer than 2
  extraTaps: number // tap budget above the perfect (one-per-car) minimum
  scoreMult: number
}

function makeLevel(
  id: Difficulty,
  label: string,
  blurb: string,
  cols: number,
  rows: number,
  cars: number,
  maxLen: number,
  longChance: number,
  extraTaps: number,
  scoreMult: number,
): LevelConfig {
  return { id, label, blurb, cols, rows, cars, maxLen, longChance, extraTaps, scoreMult }
}

export const LEVELS: Record<Difficulty, LevelConfig> = {
  easy: makeLevel('easy', 'Easy', '5×5 lot · roomy moves', 5, 5, 7, 2, 0.15, 6, 1),
  medium: makeLevel('medium', 'Medium', '6×6 lot · tighter', 6, 6, 11, 3, 0.28, 5, 1.7),
  hard: makeLevel('hard', 'Hard', '7×7 lot · gridlocked', 7, 7, 16, 3, 0.4, 4, 2.8),
}

export const DIFFICULTY_ORDER: Difficulty[] = ['easy', 'medium', 'hard']
