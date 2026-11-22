import Phaser from 'phaser';
import { FoundationScene } from '../scenes/FoundationScene.js';
import { gameConfig } from '../config/game.js';

export function createGameConfig() {
  return {
    type: Phaser.AUTO,
    parent: 'app',
    width: gameConfig.display.width,
    height: gameConfig.display.height,
    // Transparent so the CSS water gradient behind the canvas shows through.
    transparent: true,
    pixelArt: false,
    scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH,
      min: {
        width: gameConfig.presentation.scale.minimumWidth,
        height: gameConfig.presentation.scale.minimumHeight,
      },
      max: {
        width: gameConfig.presentation.scale.maximumWidth,
        height: gameConfig.presentation.scale.maximumHeight,
      },
    },
    scene: [FoundationScene],
  };
}
