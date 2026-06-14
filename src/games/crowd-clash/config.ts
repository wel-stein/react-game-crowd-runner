// ---------------------------------------------------------------------------
// Crowd Clash tuning. Self-contained — shares nothing with other games.
//
// A rival (red) army races you. Each gate section, you take the gate on your
// lane and the rival's AI takes a gate too (sized against ITS own crowd). Both
// counts grow live; at the end the two armies collide and the bigger one wins.
// ---------------------------------------------------------------------------

export type OpKind = 'add' | 'mul' | 'sub' | 'div'

export interface Operation {
  kind: OpKind
  value: number
}
export interface SectionSpec {
  left: Operation
  right: Operation
}

// --- world ------------------------------------------------------------------
export const ROAD_WIDTH = 10
export const ROAD_HALF = ROAD_WIDTH / 2
export const MAX_X = ROAD_HALF - 0.6
export const LEADER_Z = 0
export const GATE_HIT_Z = LEADER_Z

// rival army runs ahead-left and converges at the clash
export const RIVAL_X = -1.1
export const RIVAL_Z = -9
export const CLASH_Z = -3

// --- steering ---------------------------------------------------------------
export const STEER_LERP = 9
export const KEY_STEER_SPEED = 11
export const DRAG_RANGE = ROAD_WIDTH * 1.4

// --- crowd ------------------------------------------------------------------
export const START_CROWD = 10
export const MAX_CROWD = 99999
export const MAX_RENDER = 600
export const CROWD_BOB_SPEED = 9
export const CROWD_BOB_HEIGHT = 0.09
export const UNIT_SPACING = 0.62
export const YOU_HUE = 0.58 // blue
export const RIVAL_HUE = 0.01 // red

// --- gates ------------------------------------------------------------------
export const FIRST_GATE_Z = -46
export const GATE_SPACING = 28

export const BATTLE_DURATION = 1.9

const add = (value: number): Operation => ({ kind: 'add', value })
const mul = (value: number): Operation => ({ kind: 'mul', value })
const sub = (value: number): Operation => ({ kind: 'sub', value })
const div = (value: number): Operation => ({ kind: 'div', value })

// --- colors -----------------------------------------------------------------
export const COLORS = {
  add: '#34d36b',
  mul: '#ffce3a',
  penalty: '#ff5563',
  sky: '#8fd3ff',
  fog: '#bfe6c8',
  grass: '#6fcf6f',
  road: '#5b5f6b',
}

export function opColor(kind: OpKind): string {
  if (kind === 'add') return COLORS.add
  if (kind === 'mul') return COLORS.mul
  return COLORS.penalty
}
export function opLabel(op: Operation): string {
  switch (op.kind) {
    case 'add':
      return `+${op.value}`
    case 'mul':
      return `×${op.value}`
    case 'sub':
      return `-${op.value}`
    case 'div':
      return `÷${op.value}`
  }
}
export function applyOp(crowd: number, op: Operation): number {
  let next = crowd
  switch (op.kind) {
    case 'add':
      next = crowd + op.value
      break
    case 'mul':
      next = crowd * op.value
      break
    case 'sub':
      next = crowd - op.value
      break
    case 'div':
      next = crowd / op.value
      break
  }
  return Math.max(0, Math.min(MAX_CROWD, Math.round(next)))
}

// --- difficulty levels ------------------------------------------------------
export type Difficulty = 'easy' | 'medium' | 'hard'

export interface LevelConfig {
  id: Difficulty
  label: string
  blurb: string
  runSpeed: number
  rivalSkill: number // 0..1 chance the rival picks its better gate
  scoreMult: number
  sections: SectionSpec[]
  clashWorldZ: number
  clashTravel: number
}

function makeLevel(
  id: Difficulty,
  label: string,
  blurb: string,
  runSpeed: number,
  rivalSkill: number,
  scoreMult: number,
  sections: SectionSpec[],
): LevelConfig {
  const clashWorldZ = FIRST_GATE_Z - sections.length * GATE_SPACING - 30
  return {
    id,
    label,
    blurb,
    runSpeed,
    rivalSkill,
    scoreMult,
    sections,
    clashWorldZ,
    clashTravel: CLASH_Z - clashWorldZ,
  }
}

const SECTIONS: SectionSpec[] = [
  { left: add(20), right: mul(3) },
  { left: mul(2), right: add(35) },
  { left: add(40), right: mul(3) },
  { left: sub(20), right: add(70) },
  { left: mul(2), right: add(100) },
  { left: div(2), right: mul(3) },
  { left: add(150), right: mul(2) },
  { left: mul(2), right: add(220) },
  { left: add(180), right: mul(3) },
  { left: mul(2), right: add(300) },
]

export const LEVELS: Record<Difficulty, LevelConfig> = {
  easy: makeLevel('easy', 'Easy', 'Clumsy rival', 17, 0.5, 1, SECTIONS),
  medium: makeLevel('medium', 'Medium', 'Sharp rival', 21, 0.74, 1.6, SECTIONS),
  hard: makeLevel('hard', 'Hard', 'Genius rival · fast', 26, 0.92, 2.6, SECTIONS),
}

export const DIFFICULTY_ORDER: Difficulty[] = ['easy', 'medium', 'hard']
