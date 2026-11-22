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

Open the local URL printed by Vite.

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

## Project structure

- `src/main.js` — Phaser application entry point
- `src/scenes/` — application scenes and screen flow
- `src/game/` — runtime and gameplay integration
- `src/config/` — central gameplay defaults and configuration validation
- `GDD.md` — design authority
- `ROADMAP.md` — implementation phases
- `REFERENCE-OBSERVATIONS.md` — known and unknown original-game behaviour

The project uses only local code and assets; it does not require an account or hosted service.
