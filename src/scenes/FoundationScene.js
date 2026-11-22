import Phaser from 'phaser';
import { gameConfig } from '../config/game.js';
import {
  createFishPopulation,
  createSeededRandom,
  updateFishPopulation,
} from '../game/fishPopulation.js';
import { createPlayerMovement, updatePlayerMovement } from '../game/playerMovement.js';

export class FoundationScene extends Phaser.Scene {
  constructor() {
    super('Foundation');
  }

  preload() {
    this.load.svg('player-fish', '/assets/player-fish.svg');
    gameConfig.fishPopulation.visualVariants.forEach((variant) => {
      this.load.svg(`fish-${variant}`, `/assets/fish-${variant}.svg`);
    });
  }

  create() {
    const { width, height } = this.scale;
    const pondBottom = height - gameConfig.pond.bottomInset;

    this.cameras.main.setBackgroundColor(gameConfig.display.backgroundColor);

    this.add.rectangle(width / 2, pondBottom + gameConfig.pond.bottomInset / 2, width, gameConfig.pond.bottomInset, 0xc6a96d);
    this.add.ellipse(width * 0.25, pondBottom - 4, 290, 24, 0x8e7048);
    this.add.ellipse(width * 0.72, pondBottom - 2, 360, 28, 0x9a7a4e);
    this.add.ellipse(width * 0.92, pondBottom - 8, 220, 30, 0x8b6a43);

    this.addSeaweed(105, pondBottom, 0x2d8f3a, 82);
    this.addSeaweed(320, pondBottom, 0x35a34a, 70);
    this.addSeaweed(690, pondBottom, 0x25863c, 92);
    this.addSeaweed(870, pondBottom, 0x399b48, 66);

    this.playerMovement = createPlayerMovement({ x: width / 2, y: pondBottom / 2 });
    this.player = this.add.image(this.playerMovement.x, this.playerMovement.y, 'player-fish');
    this.player.setDisplaySize(76, 46);
    this.player.setFlipX(true);

    this.fishPopulation = createFishPopulation(createSeededRandom(Date.now()));
    this.fishViews = new Map();
    this.cursors = this.input.keyboard.createCursorKeys();
  }

  addSeaweed(x, bottom, color, height) {
    const graphics = this.add.graphics();
    graphics.lineStyle(8, color, 1);
    graphics.beginPath();
    graphics.moveTo(x, bottom);
    graphics.lineTo(x - 10, bottom - height * 0.45);
    graphics.lineTo(x + 6, bottom - height * 0.72);
    graphics.lineTo(x - 4, bottom - height);
    graphics.strokePath();
  }

  update(_time, deltaMilliseconds) {
    if (!this.player || !this.cursors || !this.fishPopulation) {
      return;
    }

    const { width, height } = this.scale;
    const pondBottom = height - gameConfig.pond.bottomInset;
    const elapsedSeconds = deltaMilliseconds / 1000;
    this.playerMovement = updatePlayerMovement(
      this.playerMovement,
      {
        left: this.cursors.left.isDown,
        right: this.cursors.right.isDown,
        up: this.cursors.up.isDown,
        down: this.cursors.down.isDown,
      },
      elapsedSeconds,
      gameConfig.player,
      {
        left: 0,
        right: width,
        top: 0,
        bottom: pondBottom,
        radius: 38,
      },
    );

    this.player.setPosition(this.playerMovement.x, this.playerMovement.y);
    if (this.playerMovement.velocityX < -5) {
      this.player.setFlipX(false);
    } else if (this.playerMovement.velocityX > 5) {
      this.player.setFlipX(true);
    }

    updateFishPopulation(
      this.fishPopulation,
      elapsedSeconds,
      { width, height, bottomInset: gameConfig.pond.bottomInset },
      gameConfig.fishPopulation,
    );
    this.updateFishViews();
  }

  updateFishViews() {
    const fishIds = new Set(this.fishPopulation.fish.map((fish) => fish.id));
    for (const [id, view] of this.fishViews) {
      if (!fishIds.has(id)) {
        view.destroy();
        this.fishViews.delete(id);
      }
    }

    for (const fish of this.fishPopulation.fish) {
      let view = this.fishViews.get(fish.id);
      if (!view) {
        view = this.add.image(
          fish.x,
          fish.y,
          `fish-${gameConfig.fishPopulation.visualVariants[fish.variant]}`,
        );
        this.fishViews.set(fish.id, view);
      }

      view.setPosition(fish.x, fish.y);
      view.setDisplaySize(fish.size, fish.size * 0.6);
      view.setFlipX(fish.direction < 0);
    }
  }
}
