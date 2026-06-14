export const clamp = (v: number, min: number, max: number): number =>
  v < min ? min : v > max ? max : v
export const lerp = (a: number, b: number, t: number): number => a + (b - a) * t
export const easeOutCubic = (t: number): number => 1 - Math.pow(1 - t, 3)
export const hash = (n: number): number => {
  const s = Math.sin(n * 127.1) * 43758.5453123
  return s - Math.floor(s)
}
