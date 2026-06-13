import {
  FIRST_GATE_Z,
  GATE_SPACING,
  LEVELS,
  type Difficulty,
  type LevelConfig,
  type SectionSpec,
} from '../config'

// Live, per-frame mutable game state that is read/written inside useFrame loops.
// Kept OUT of React/zustand to avoid 60fps re-renders. Components read these
// fields directly in their own useFrame callbacks.

export interface LiveSection extends SectionSpec {
  worldZ: number
  resolved: boolean
  chosen: 'left' | 'right' | null
}

export interface GameRuntime {
  time: number // accumulated run time (for animation)
  traveled: number // distance scrolled toward the boss
  leaderX: number // current horizontal crowd position
  targetX: number // steering target X
  keyLeft: boolean
  keyRight: boolean
  shake: number // camera shake magnitude (decays)
  battleTime: number
  battleRush: number // how far the crowd has surged into the boss (0..1)
  level: LevelConfig // active difficulty preset
  sections: LiveSection[]
}

function buildSections(level: LevelConfig): LiveSection[] {
  return level.sections.map((s, i) => ({
    ...s,
    worldZ: FIRST_GATE_Z - i * GATE_SPACING,
    resolved: false,
    chosen: null,
  }))
}

export const game: GameRuntime = {
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

// Pick a difficulty and rebuild the gate layout for it. Called when (re)starting.
export function startRun(difficulty: Difficulty): void {
  game.level = LEVELS[difficulty]
  game.sections = buildSections(game.level)
  resetRuntime()
}

export function resetRuntime(): void {
  game.time = 0
  game.traveled = 0
  game.leaderX = 0
  game.targetX = 0
  game.keyLeft = false
  game.keyRight = false
  game.shake = 0
  game.battleTime = 0
  game.battleRush = 0
  for (const s of game.sections) {
    s.resolved = false
    s.chosen = null
  }
}
