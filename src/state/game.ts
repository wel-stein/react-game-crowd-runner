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

export interface Slam {
  at: number // progress (0..1) at which the telegraph begins
  side: -1 | 1 // which half of the road is dangerous
  warnStart: number | null // game.time when telegraph started
  resolved: boolean
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
  slams: Slam[]
}

function buildSections(level: LevelConfig): LiveSection[] {
  return level.sections.map((s, i) => ({
    ...s,
    worldZ: FIRST_GATE_Z - i * GATE_SPACING,
    resolved: false,
    chosen: null,
  }))
}

// Schedule the boss's telegraphed slams across the final approach (progress
// 0.80 .. 0.92), alternating sides so the player must steer to the safe half.
function buildSlams(level: LevelConfig): Slam[] {
  const n = level.slamCount
  const slams: Slam[] = []
  for (let i = 0; i < n; i++) {
    const at = n === 1 ? 0.86 : 0.8 + (0.12 * i) / (n - 1)
    slams.push({ at, side: i % 2 === 0 ? -1 : 1, warnStart: null, resolved: false })
  }
  return slams
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
  slams: buildSlams(LEVELS.easy),
}

// Pick a difficulty and rebuild the gate layout for it. Called when (re)starting.
export function startRun(difficulty: Difficulty): void {
  game.level = LEVELS[difficulty]
  game.sections = buildSections(game.level)
  game.slams = buildSlams(game.level)
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
