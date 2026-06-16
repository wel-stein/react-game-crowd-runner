import { CAR_COLORS, type Dir, type LevelConfig, type Orient } from '../config'
import { cellKey, type Car } from './grid'

// Reverse-construction level generator — guarantees the puzzle is solvable.
//
// We build the lot by sliding cars *in* one at a time from the edge they would
// later exit through, only placing a car when its whole entry lane (rest cells
// + the path back to that edge) is currently free. The reverse of the insertion
// order is then a valid solve order: when you remove cars newest-first, each
// car's exit lane is exactly the lane it slid in through, which was clear at
// insertion time. So a solution always exists.

const DIRS: Record<Orient, Dir[]> = {
  h: [
    [1, 0],
    [-1, 0],
  ],
  v: [
    [0, 1],
    [0, -1],
  ],
}

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

export function generateLevel(cfg: LevelConfig): Car[] {
  const { cols, rows } = cfg
  const occupied = new Set<string>()
  const cars: Car[] = []
  let colorIdx = Math.floor(Math.random() * CAR_COLORS.length)

  const maxAttempts = cfg.cars * 80
  for (let attempt = 0; attempt < maxAttempts && cars.length < cfg.cars; attempt++) {
    const orient: Orient = Math.random() < 0.5 ? 'h' : 'v'
    const len = Math.random() < cfg.longChance ? Math.min(cfg.maxLen, 3) : 2
    const dir = pick(DIRS[orient])

    const lineLen = orient === 'h' ? cols : rows // length along the car's axis
    if (len > lineLen) continue

    // rest cells: a run of `len` cells along the axis, on some line
    const along = orient === 'h' ? rows : cols // number of parallel lines
    const line = Math.floor(Math.random() * along)
    const start = Math.floor(Math.random() * (lineLen - len + 1))

    const cells: [number, number][] = []
    for (let i = 0; i < len; i++) {
      const axis = start + i
      cells.push(orient === 'h' ? [axis, line] : [line, axis])
    }

    // entry lane: from the car's leading edge cell out to the border, along dir
    const [dc, dr] = dir
    let [fc, fr] = cells[0]
    for (const [c, r] of cells) {
      if (c * dc + r * dr > fc * dc + fr * dr) {
        fc = c
        fr = r
      }
    }
    const lane: [number, number][] = []
    let lc = fc + dc
    let lr = fr + dr
    while (lc >= 0 && lc < cols && lr >= 0 && lr < rows) {
      lane.push([lc, lr])
      lc += dc
      lr += dr
    }

    // every rest + lane cell must currently be free
    const needed = [...cells, ...lane]
    if (needed.some(([c, r]) => occupied.has(cellKey(c, r)))) continue

    for (const [c, r] of cells) occupied.add(cellKey(c, r))
    cars.push({
      id: cars.length,
      orient,
      len,
      cells,
      dir,
      color: CAR_COLORS[colorIdx % CAR_COLORS.length],
      status: 'parked',
    })
    colorIdx++
  }

  return cars
}
