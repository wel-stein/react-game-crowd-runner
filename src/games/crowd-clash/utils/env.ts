export const REDUCED_MOTION =
  typeof window !== 'undefined' &&
  window.matchMedia?.('(prefers-reduced-motion: reduce)').matches === true
export const SHAKE_SCALE = REDUCED_MOTION ? 0.15 : 1
