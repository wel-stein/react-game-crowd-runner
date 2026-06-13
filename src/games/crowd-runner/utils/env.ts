// Respect the OS "reduce motion" accessibility setting by damping camera shake.
export const REDUCED_MOTION =
  typeof window !== 'undefined' &&
  window.matchMedia?.('(prefers-reduced-motion: reduce)').matches === true

export const SHAKE_SCALE = REDUCED_MOTION ? 0.15 : 1
