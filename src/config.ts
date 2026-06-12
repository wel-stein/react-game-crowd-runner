// ---------------------------------------------------------------------------
// Central tuning file. Tweak these to change difficulty, pacing and feel.
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

// --- Road / world -----------------------------------------------------------
export const ROAD_WIDTH = 10 // total drivable width
export const ROAD_HALF = ROAD_WIDTH / 2
export const EDGE_PADDING = 0.6 // keep the leader off the very edge
export const MAX_X = ROAD_HALF - EDGE_PADDING

// How far in front of the camera the crowd leader stands (z grows toward camera)
export const LEADER_Z = 0

// --- Speed / pacing ---------------------------------------------------------
export const RUN_SPEED = 17 // world units travelled per second
export const STEER_LERP = 9 // how snappily the crowd follows the target X
export const KEY_STEER_SPEED = 11 // units/sec when holding a key
export const DRAG_RANGE = ROAD_WIDTH * 1.4 // full-screen drag = this much X travel

// --- Crowd ------------------------------------------------------------------
export const START_CROWD = 1
export const MAX_CROWD = 2000 // logical clamp
export const MAX_RENDER = 600 // hard cap on rendered instances (perf)
export const CROWD_BOB_SPEED = 9
export const CROWD_BOB_HEIGHT = 0.09
export const UNIT_SPACING = 0.62 // controls cluster density

// --- Gates ------------------------------------------------------------------
export const FIRST_GATE_Z = -48
export const GATE_SPACING = 30
export const GATE_HIT_Z = LEADER_Z // crowd front line is at the leader

const add = (value: number): Operation => ({ kind: 'add', value })
const mul = (value: number): Operation => ({ kind: 'mul', value })
const sub = (value: number): Operation => ({ kind: 'sub', value })
const div = (value: number): Operation => ({ kind: 'div', value })

// Each section shows two gates. The "right pick" depends on current crowd size,
// which is what makes the steering decision interesting.
export const GATE_SECTIONS: SectionSpec[] = [
  { left: add(15), right: mul(3) },
  { left: mul(2), right: add(25) },
  { left: add(30), right: mul(3) },
  { left: sub(15), right: add(60) },
  { left: mul(2), right: add(90) },
  { left: div(2), right: mul(3) },
  { left: add(120), right: mul(2) },
  { left: mul(2), right: add(160) },
]

export const NUM_SECTIONS = GATE_SECTIONS.length

// --- Boss -------------------------------------------------------------------
export const BOSS_HEALTH = 600
export const BOSS_WORLD_Z = FIRST_GATE_Z - NUM_SECTIONS * GATE_SPACING - 36
export const BOSS_STOP_Z = -4 // where the boss comes to rest in front of the crowd
export const BATTLE_DURATION = 1.8 // seconds of the final clash

// Total distance travelled when the boss fight begins (progress bar = 1.0).
export const BOSS_TRAVEL = BOSS_STOP_Z - BOSS_WORLD_Z

// --- Colors -----------------------------------------------------------------
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
  next = Math.round(next)
  return Math.max(0, Math.min(MAX_CROWD, next))
}
