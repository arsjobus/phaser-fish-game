import Phaser from 'phaser';
import { createGameConfig } from './game/gameConfig.js';

const game = new Phaser.Game(createGameConfig());

// Development-only handle for browser-driven checks. Stripped from production
// builds because `import.meta.env.DEV` is false there.
if (import.meta.env.DEV) {
  window.__game = game;
}
