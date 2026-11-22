import Phaser from 'phaser';
import { FoundationScene } from '../scenes/FoundationScene.js';
import { gameConfig } from '../config/game.js';

export function createGameConfig() {
  return {
    type: Phaser.AUTO,
    parent: 'app',
    width: gameConfig.display.width,
    height: gameConfig.display.height,
    backgroundColor: gameConfig.display.backgroundColor,
    pixelArt: false,
    scene: [FoundationScene],
  };
}
