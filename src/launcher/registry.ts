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
  {
    id: 'crowd-clash',
    title: 'Crowd Clash',
    tagline: 'Out-grow the red rival army and win the final clash',
    emoji: '⚔️',
    accent: '#ff7a3a',
  },
  {
    id: 'car-jam',
    title: 'Car Jam',
    tagline: 'Tap cars to clear the lot — free the blockers first',
    emoji: '🚗',
    accent: '#41c98a',
  },
  {
    id: 'chess-endgames',
    title: 'Chess Endgames',
    tagline: 'Solve bite-size endgames — White to play and win',
    emoji: '♟️',
    accent: '#6f9b53',
  },
]
