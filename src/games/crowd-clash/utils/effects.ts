// Imperative particle-burst bus — isolated to the Crowd Clash game.
type BurstFn = (x: number, y: number, z: number, color: string) => void
const handlers = new Set<BurstFn>()
export function onBurst(fn: BurstFn): () => void {
  handlers.add(fn)
  return () => handlers.delete(fn)
}
export function emitBurst(x: number, y: number, z: number, color: string): void {
  handlers.forEach((h) => h(x, y, z, color))
}
