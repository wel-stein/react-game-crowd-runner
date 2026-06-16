import type { Dir, Orient } from '../config'
import { CELL_SIZE } from '../config'

export type Cell = readonly [number, number] // [col, row]

export type CarStatus = 'parked' | 'leaving' | 'gone'

export interface Car {
  id: number
  orient: Orient
  len: number
  cells: Cell[] // occupied grid cells, ordered along the axis
  dir: Dir // exit direction (unit vector along the axis)
  color: string
  status: CarStatus
}

export const cellKey = (c: number, r: number): string => `${c},${r}`

// Cells of all parked cars (optionally skipping one), as a fast lookup set.
export function occupancy(cars: Car[], skipId?: number): Set<string> {
  const set = new Set<string>()
  for (const car of cars) {
    if (car.status !== 'parked' || car.id === skipId) continue
    for (const [c, r] of car.cells) set.add(cellKey(c, r))
  }
  return set
}

// Can this car drive straight off the lot in its facing direction? True when
// every cell between the car's front and the matching edge is empty.
export function pathClear(car: Car, cars: Car[], cols: number, rows: number): boolean {
  const occ = occupancy(cars, car.id)
  const [dc, dr] = car.dir
  // front cell = the occupied cell furthest along the exit direction
  let [fc, fr] = car.cells[0]
  for (const [c, r] of car.cells) {
    if (c * dc + r * dr > fc * dc + fr * dr) {
      fc = c
      fr = r
    }
  }
  let c = fc + dc
  let r = fr + dr
  while (c >= 0 && c < cols && r >= 0 && r < rows) {
    if (occ.has(cellKey(c, r))) return false
    c += dc
    r += dr
  }
  return true
}

// Centre of a car (in grid coords) → world [x, z]. The lot is centred on the
// origin with row 0 at the back.
export function gridToWorld(col: number, row: number, cols: number, rows: number): [number, number] {
  const x = (col - (cols - 1) / 2) * CELL_SIZE
  const z = (row - (rows - 1) / 2) * CELL_SIZE
  return [x, z]
}

export function carCenter(car: Car, cols: number, rows: number): [number, number] {
  let sc = 0
  let sr = 0
  for (const [c, r] of car.cells) {
    sc += c
    sr += r
  }
  return gridToWorld(sc / car.cells.length, sr / car.cells.length, cols, rows)
}
