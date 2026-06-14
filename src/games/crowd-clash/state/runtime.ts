import {
  FIRST_GATE_Z,
  GATE_SPACING,
  LEVELS,
  type Difficulty,
  type LevelConfig,
  type SectionSpec,
} from '../config'

// Per-frame mutable runtime, kept out of React. Isolated to Crowd Clash.

export interface LiveSection extends SectionSpec {
  worldZ: number
  resolved: boolean
  youChose: 'left' | 'right' | null
  rivalChose: 'left' | 'right' | null
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
  battleRush: number // 0..1 convergence at the clash
  level: LevelConfig
  sections: LiveSection[]
}

function buildSections(level: LevelConfig): LiveSection[] {
  return level.sections.map((s, i) => ({
    ...s,
    worldZ: FIRST_GATE_Z - i * GATE_SPACING,
    resolved: false,
    youChose: null,
    rivalChose: null,
  }))
}

export const ccgame: Runtime = {
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
  sections: buildSections(LEVELS.easy),
}

export function startRun(difficulty: Difficulty): void {
  ccgame.level = LEVELS[difficulty]
  ccgame.sections = buildSections(ccgame.level)
  resetRuntime()
}

export function resetRuntime(): void {
  ccgame.time = 0
  ccgame.traveled = 0
  ccgame.leaderX = 0
  ccgame.targetX = 0
  ccgame.keyLeft = false
  ccgame.keyRight = false
  ccgame.shake = 0
  ccgame.battleTime = 0
  ccgame.battleRush = 0
  for (const s of ccgame.sections) {
    s.resolved = false
    s.youChose = null
    s.rivalChose = null
  }
}
