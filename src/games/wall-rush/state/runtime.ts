import {
  FIRST_ROW_Z,
  LEVELS,
  ROW_SPACING,
  type Cell,
  type Difficulty,
  type LevelConfig,
} from '../config'

// Per-frame mutable runtime, kept out of React. Isolated to Wall Rush.

export interface Row {
  left: Cell
  right: Cell
  worldZ: number
  resolved: boolean
  collected: 'left' | 'right' | null
}

export interface Runtime {
  time: number
  traveled: number
  leaderX: number
  targetX: number
  keyLeft: boolean
  keyRight: boolean
  shake: number
  battleTime: number
  battleRush: number
  level: LevelConfig
  rows: Row[]
}

function buildRows(level: LevelConfig): Row[] {
  const rows: Row[] = []
  for (let i = 0; i < level.rows; i++) {
    const isTrap = i > 0 && i % level.penaltyEvery === 0
    rows.push({
      left: { kind: 'small', value: level.smallValue },
      right: isTrap
        ? { kind: 'penalty', value: level.penaltyValue }
        : { kind: 'big', value: level.bigValue },
      worldZ: FIRST_ROW_Z - i * ROW_SPACING,
      resolved: false,
      collected: null,
    })
  }
  return rows
}

export const wgame: Runtime = {
  time: 0,
  traveled: 0,
  leaderX: 0,
  targetX: 0,
  keyLeft: false,
  keyRight: false,
  shake: 0,
  battleTime: 0,
  battleRush: 0,
  level: LEVELS.easy,
  rows: buildRows(LEVELS.easy),
}

export function startRun(difficulty: Difficulty): void {
  wgame.level = LEVELS[difficulty]
  wgame.rows = buildRows(wgame.level)
  resetRuntime()
}

export function resetRuntime(): void {
  wgame.time = 0
  wgame.traveled = 0
  wgame.leaderX = 0
  wgame.targetX = 0
  wgame.keyLeft = false
  wgame.keyRight = false
  wgame.shake = 0
  wgame.battleTime = 0
  wgame.battleRush = 0
  for (const r of wgame.rows) {
    r.resolved = false
    r.collected = null
  }
}
