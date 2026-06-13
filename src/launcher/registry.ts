// Metadata for every game shown on the home screen. The heavy game module is
// loaded lazily (see App.tsx) only when the player opens it, so games stay
// fully isolated and never run side-by-side.
export interface GameMeta {
  id: string
  title: string
  tagline: string
  emoji: string
  accent: string // card gradient base color
}

export const GAMES: GameMeta[] = [
  {
    id: 'crowd-runner',
    title: 'Crowd Runner',
    tagline: 'Pick gates, grow your army, crush the boss',
    emoji: '🏃',
    accent: '#3aa0ff',
  },
  {
    id: 'wall-rush',
    title: 'Wall Rush',
    tagline: 'Sweep the +99 wall, dodge the ÷2 traps, smash the golem',
    emoji: '🧱',
    accent: '#ff4fd8',
  },
]
