# 🏃 Crowd Runner

A browser-based **crowd runner** game in the style of *Count Masters* / *Join
Clash*. Steer a growing army of stick-figure units down an endless road, pick
the best multiplier/adder gates, and smash the whole crowd into the boss at the
end.

Built with **Vite + React + TypeScript**, **React Three Fiber** + **drei** for
the 3D scene, and **Zustand** for game state. The crowd is rendered with
**instanced meshes** so hundreds of units draw in just two draw calls and stay
at 60fps. No backend — it deploys as a fully static site.

## Quick start

```bash
npm install
npm run dev
```

Then open the printed local URL (default http://localhost:5173).

To build a static production bundle:

```bash
npm run build      # outputs to dist/
npm run preview    # serve the built bundle locally
```

## How to play

- On the start screen, pick a **difficulty**:
  - 🟢 **Easy** — gentle pace, forgiving gates, boss 600 HP
  - 🟠 **Medium** — faster, more penalty gates, boss 1400 HP
  - 🔴 **Hard** — breakneck speed, brutal gate choices, boss 3200 HP
- **Steer** with mouse/touch drag, or the **arrow keys** / **A** and **D**.
- You can only move **left/right** — the crowd always runs forward.
- Each section has **two gates**. Their effect on your crowd:
  - 🟢 `+N` — adds units
  - 🟡 `×N` — multiplies your crowd (huge late game)
  - 🔴 `-N` / `÷N` — penalty gates, avoid these!
- The best pick depends on your **current crowd size** (`+20` beats `×2` when
  you're small; `×2` wins once you're big).
- Reach the **boss** at the end: if your crowd ≥ the boss's health, you win.

## Project structure

```
src/
  config.ts            # all tunable constants (speed, gates, boss health, ...)
  state/
    store.ts           # zustand store (React-facing game state)
    game.ts            # per-frame mutable runtime (kept out of React)
  hooks/
    useControls.ts     # pointer-drag + keyboard steering
  utils/
    math.ts            # clamp / lerp / easing / hash
    formation.ts       # clustered crowd "blob" layout
    effects.ts         # imperative particle-burst event bus
  components/
    Scene.tsx          # Canvas, lights, fog, assembles the world
    GameController.tsx # the core game loop
    Crowd.tsx          # instanced-mesh crowd
    Gates.tsx          # gate sections + operations
    Boss.tsx           # boss model + health number
    Road.tsx           # scrolling road
    Background.tsx     # hills + grass
    Particles.tsx      # pooled instanced particle bursts
    HUD.tsx            # 2D UI + start/win/lose overlays
```

## Tuning difficulty

Everything you'd want to adjust lives in [`src/config.ts`](src/config.ts).
The three difficulties are defined in the `LEVELS` map — each sets its own run
speed, boss health and gate sequence, so you can retune a level or add a new one
in one place. Shared knobs (gate spacing, max crowd size, render cap) sit
alongside it.
