// ---------------------------------------------------------------------------
// Wall Rush tuning. Self-contained — shares nothing with other games.
//
// Mechanic: you run down a corridor with a blue "+1" wall on the left and a
// gold "+99" wall on the right. Hug a wall to collect that row's value as the
// crowd passes it. The gold wall grows you fast but is studded with red "÷2"
// traps — swerve to the centre or the blue wall to dodge them.
// ---------------------------------------------------------------------------

export type CellKind = 'small' | 'big' | 'penalty'

export interface Cell {
  kind: CellKind
  value: number
}

// --- world ------------------------------------------------------------------
export const ROAD_WIDTH = 8
export const ROAD_HALF = ROAD_WIDTH / 2
export const MAX_X = ROAD_HALF - 0.6
export const LEADER_Z = 0
export const ROW_HIT_Z = LEADER_Z

export const WALL_X = 2.7 // x position of each wall
// you "hug" a wall when the leader is past this |x|; the middle band collects
// nothing, which is the dodge lane for ÷2 traps
export const HUG_X = 1.3

// --- steering ---------------------------------------------------------------
export const STEER_LERP = 10
export const KEY_STEER_SPEED = 12
export const DRAG_RANGE = ROAD_WIDTH * 1.4

// --- crowd ------------------------------------------------------------------
export const START_CROWD = 5
export const MAX_CROWD = 99999
export const MAX_RENDER = 600
export const CROWD_BOB_SPEED = 10
export const CROWD_BOB_HEIGHT = 0.09
export const UNIT_SPACING = 0.6
// magenta army to match the reference art
export const CROWD_HUE = 0.86
export const CROWD_SAT = 0.85
export const CROWD_LIGHT = 0.6

// --- rows / walls -----------------------------------------------------------
export const FIRST_ROW_Z = -46
export const ROW_SPACING = 7

// --- boss -------------------------------------------------------------------
export const BOSS_STOP_Z = -5
export const BATTLE_DURATION = 1.8

// --- colors -----------------------------------------------------------------
export const COLORS = {
  small: '#2f7bff', // blue +1 wall
  big: '#ffce3a', // gold +99 wall
  penalty: '#ff4b4b', // red ÷2 trap
  sky: '#a9e2ff',
  fog: '#bfe6c8',
  grass: '#5fc46b',
  road: '#d7dbe2',
}

export function cellColor(kind: CellKind): string {
  return COLORS[kind]
}

export function cellLabel(c: Cell): string {
  if (c.kind === 'penalty') return `÷${c.value}`
  return `+${c.value}`
}

export function applyCell(crowd: number, c: Cell): number {
  const next = c.kind === 'penalty' ? Math.ceil(crowd / c.value) : crowd + c.value
  return Math.max(0, Math.min(MAX_CROWD, Math.round(next)))
}

// --- difficulty levels ------------------------------------------------------
export type Difficulty = 'easy' | 'medium' | 'hard'

export interface LevelConfig {
  id: Difficulty
  label: string
  blurb: string
  runSpeed: number
  bossHealth: number
  rows: number
  penaltyEvery: number // every Nth gold row is a ÷2 trap instead
  smallValue: number
  bigValue: number
  penaltyValue: number
  scoreMult: number
  bossWorldZ: number
  bossTravel: number
}

function makeLevel(
  id: Difficulty,
  label: string,
  blurb: string,
  runSpeed: number,
  bossHealth: number,
  rows: number,
  penaltyEvery: number,
  scoreMult: number,
): LevelConfig {
  const bossWorldZ = FIRST_ROW_Z - rows * ROW_SPACING - 28
  return {
    id,
    label,
    blurb,
    runSpeed,
    bossHealth,
    rows,
    penaltyEvery,
    smallValue: 1,
    bigValue: 99,
    penaltyValue: 2,
    scoreMult,
    bossWorldZ,
    bossTravel: BOSS_STOP_Z - bossWorldZ,
  }
}

export const LEVELS: Record<Difficulty, LevelConfig> = {
  easy: makeLevel('easy', 'Easy', 'Slow · few ÷2 traps', 16, 700, 22, 6, 1),
  medium: makeLevel('medium', 'Medium', 'Faster · more traps', 20, 1500, 28, 4, 1.6),
  hard: makeLevel('hard', 'Hard', 'Breakneck · trap gauntlet', 25, 2600, 34, 3, 2.6),
}

export const DIFFICULTY_ORDER: Difficulty[] = ['easy', 'medium', 'hard']
