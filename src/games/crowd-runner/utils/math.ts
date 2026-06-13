export const clamp = (v: number, min: number, max: number): number =>
  v < min ? min : v > max ? max : v

export const lerp = (a: number, b: number, t: number): number => a + (b - a) * t

// Smooth ease-out, nice for battle / progress animations.
export const easeOutCubic = (t: number): number => 1 - Math.pow(1 - t, 3)

export const easeOutQuad = (t: number): number => 1 - (1 - t) * (1 - t)

// Deterministic pseudo-random in [0,1) from an integer seed.
export const hash = (n: number): number => {
  const s = Math.sin(n * 127.1) * 43758.5453123
  return s - Math.floor(s)
}
