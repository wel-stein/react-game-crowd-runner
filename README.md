# 🎮 Game Hub

A browser-based **mini-game hub**. The home screen shows a grid of game cards;
tap one to play. Each game is a fully **isolated, self-contained module** —
its own state, runtime, effects and styles — and is **lazy-loaded** so only one
game's code ever runs at a time. Adding a game is just a new folder + a registry
entry.

Built with **Vite + React + TypeScript**, **React Three Fiber** + **drei** for
the 3D scenes, and **Zustand** for per-game state. Crowds render with
**instanced meshes** so hundreds of units draw in a couple of draw calls at
60fps. No backend — it deploys as a fully static site.

## Games

### 🏃 Crowd Runner

Steer a growing army down the road, choosing between paired `+N` / `×N` gates
(and dodging `-N` / `÷N` penalties), then smash the crowd into a boss with a
health bar. Three difficulties; Medium/Hard add telegraphed boss slams.

### 🧱 Wall Rush

A different loop: run a corridor with a blue **`+1`** wall on the left and a gold
**`+99`** wall on the right. **Hug a wall to collect that row's value** as the
crowd passes it — the gold wall grows you fast but is studded with red **`÷2`**
traps, so swerve to the centre lane to dodge them before smashing a stone golem.

### ⚔️ Crowd Clash

Race a **red rival army**. Each section you take the gate on your lane and the
rival's AI grabs a gate too (sized against *its* crowd), so both counts grow
live — a running **lead indicator** shows who's ahead. At the end the two armies
collide and the bigger one wins. Difficulty sets the rival's smarts (50% → 92%).

### 🚗 Car Jam

A change of pace — a **tap puzzle**, not a runner. A parking lot is packed with
cars, each with an arrow on its roof. **Tap a car to drive it straight off the
lot** in its arrow's direction — but it only leaves if the lane ahead is clear,
so you have to **free the blockers first**. Clear every car before your **tap
budget** runs out; wasting taps on blocked cars costs you stars. Levels are
**procedurally generated and always solvable** (reverse-construction), with 5×5,
6×6 and 7×7 lots across the three difficulties.

### ♟️ Chess Endgames

A campaign of bite-size **chess puzzles** — a pure 2D board game (no 3D scene).
You always play **White and move first**. Each puzzle is either *find the one
winning idea* (e.g. the "taboo bishop" `Bf3+` that checks and stops `…h1=Q`) or
*deliver mate in N* against a built-in defending engine. Every position is
**engine-verified**; earn 1–3 stars per puzzle (fewer for using a hint or
retrying), saved locally.

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

- From the **home screen**, tap a game card to start. A **‹ Games** button on
  each game's title screen returns you to the hub.
- Pick a **difficulty** (Easy / Medium / Hard) — each tunes speed, boss health
  and hazards.
- **Steer** with mouse/touch drag, or the **arrow keys** / **A** and **D**. You
  only move left/right — the crowd always runs forward.
- **Pause** with **Esc** / **P** (or the on-screen button); games auto-pause if
  you switch tabs.
- Win to earn a **1–3 star** rating and a **score** — your best per difficulty
  is saved locally (per game) and shown on the menu.

## Project structure

```
src/
  main.tsx                 # entry
  App.tsx                  # hub: lazy-loads the active game, else shows Launcher
  launcher/
    Launcher.tsx           # home screen (game cards)
    registry.ts            # game metadata (id, title, icon, accent)
    launcher.css
  games/
    crowd-runner/          # ── fully isolated game ──────────────
      CrowdRunnerGame.tsx  # self-contained root (own scene + HUD + CSS)
      config.ts            # tunables incl. the LEVELS difficulty map
      state/ hooks/ utils/ components/
      crowd-runner.css
    wall-rush/             # ── fully isolated game ──────────────
      WallRushGame.tsx     # corridor +1/+99 wall-collection mechanic
      config.ts state/ hooks/ utils/ components/
      wall-rush.css
    car-jam/               # ── fully isolated game ──────────────
      CarJamGame.tsx       # tap-to-unblock parking-lot puzzle
      config.ts state/ utils/ components/   # utils/generate.ts builds solvable lots
      car-jam.css
    chess-endgames/        # ── fully isolated game ──────────────
      ChessEndgamesGame.tsx # 2D chess endgame puzzle campaign
      engine.ts config.ts state/ components/   # engine.ts = self-contained chess rules + AI
      chess-endgames.css
```

### Isolation & adding a game

Each game owns **everything** — its zustand store, per-frame runtime singleton,
particle-effects bus, config, components and CSS (classes are namespaced, e.g.
`wr-*` for Wall Rush). Games are **lazy-loaded** in `App.tsx`, so a game's code
and globals don't even exist until you open it, and only one game is ever
mounted — they cannot interfere with each other.

To add a game: create `src/games/<id>/<Name>Game.tsx` exporting a component that
takes `{ onExit }`, add a `lazy()` entry in `App.tsx`, and a card in
`launcher/registry.ts`.

### Tuning difficulty

Each game's tunables live in its own `config.ts`. Difficulties are defined in a
`LEVELS` map (run speed, boss health, gate/wall layout, score multiplier), so
you can retune or add a level in one place per game.
