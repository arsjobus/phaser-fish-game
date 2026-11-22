# Fish Food

A faithful, self-contained reconstruction of the classic continuous browser game, built with Phaser 3.

## Requirements

- Node.js 20 or newer
- npm

## Setup

```bash
npm install
```

## Run locally

```bash
npm run dev
```

Open the local URL printed by Vite. In dev mode the Phaser game is also exposed as `window.__game` for browser-driven checks.

## Build

```bash
npm run build
```

The distributable static game is written to `dist/`.

## Test

```bash
npm test
```

Tests run with Vitest and do not require a visible browser window.

## Controls

- Arrow keys: swim
- Enter, Space, or an arrow key: start and replay
- `M`: mute or unmute all sound
- Lower-left buttons (click): toggle music and sound effects separately

If the window loses focus during a run, the game pauses and waits for a key press or click before resuming.

## Audio

Music and effects are synthesised at runtime with the Web Audio API, so the game ships no audio files. Browsers only start audio after a key press or click, so music begins when a run starts. If Web Audio is unavailable the game runs silently.

## Display

The 960×540 playfield scales to fit the window (16:9, letterboxed) between 480×270 and 1920×1080. Windows smaller than 480×270 are clipped.

## Project structure

- `src/main.js` — Phaser application entry point
- `src/scenes/` — application scenes and screen flow
- `src/game/` — gameplay rules, audio controller, music score, and presentation helpers (all unit-tested)
- `src/presentation/` — pond backdrop, title/HUD/end screens, sound controls
- `src/audio/` — Web Audio synth backend
- `src/config/` — central gameplay defaults and configuration validation
- `GDD.md` — design authority
- `ROADMAP.md` — implementation phases
- `REFERENCE-OBSERVATIONS.md` — known and unknown original-game behaviour

The project uses only local code and assets; it does not require an account or hosted service.
