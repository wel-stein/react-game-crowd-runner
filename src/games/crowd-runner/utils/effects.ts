// Tiny imperative effects bus so gameplay code can fire particle bursts and
// camera shake without prop-drilling refs through the scene graph.

type BurstFn = (x: number, y: number, z: number, color: string) => void

const burstHandlers = new Set<BurstFn>()

export function onBurst(fn: BurstFn): () => void {
  burstHandlers.add(fn)
  return () => burstHandlers.delete(fn)
}

export function emitBurst(x: number, y: number, z: number, color: string): void {
  burstHandlers.forEach((h) => h(x, y, z, color))
}
