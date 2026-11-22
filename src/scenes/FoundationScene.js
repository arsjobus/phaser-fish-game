import Phaser from 'phaser';
import { gameConfig } from '../config/game.js';
import {
  createFishPopulation,
  createSeededRandom,
  updateFishPopulation,
} from '../game/fishPopulation.js';
import { formatScore, updateRunProgress } from '../game/runProgress.js';
import { createPlayerMovement, updatePlayerMovement } from '../game/playerMovement.js';
import {
  createRunState,
  resolveFishCollisions,
} from '../game/foodChain.js';
import {
  createGameState,
  GAME_STATES,
  transitionGameState,
} from '../game/gameState.js';
import { loadHighScores, saveHighScore } from '../game/highScores.js';

export class FoundationScene extends Phaser.Scene {
  constructor() {
    super('Foundation');
  }

  preload() {
    this.load.svg(
      'player-fish',
      `${import.meta.env.BASE_URL}assets/player-fish.svg`,
    );
    gameConfig.fishPopulation.visualVariants.forEach((variant) => {
      this.load.svg(
        `fish-${variant}`,
        `${import.meta.env.BASE_URL}assets/fish-${variant}.svg`,
      );
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

    this.cursors = this.input.keyboard.createCursorKeys();
    this.enterKey = this.input.keyboard.addKey(
      Phaser.Input.Keyboard.KeyCodes.ENTER,
    );
    this.spaceKey = this.input.keyboard.addKey(
      Phaser.Input.Keyboard.KeyCodes.SPACE,
    );
    this.applicationState = createGameState();
    this.highScores = loadHighScores(window.localStorage);
    this.titleViews = [];
    this.endViews = [];
    this.player = null;
    this.createTitle();
  }

  createHud() {
    this.scoreText = this.add
      .text(this.scale.width / 2, 18, '0', {
        fontFamily: 'Arial',
        fontSize: '24px',
        fontStyle: 'bold',
        color: '#fff4d6',
        align: 'center',
      })
      .setOrigin(0.5, 0);
    this.scoreText.setDepth(50);

    this.eatenIcon = this.add
      .image(18, 24, 'player-fish')
      .setDisplaySize(30, 18)
      .setOrigin(0, 0.5)
      .setFlipX(true);
    this.eatenIcon.setDepth(50);
    this.eatenText = this.add
      .text(54, 18, '0', {
        fontFamily: 'Arial',
        fontSize: '20px',
        fontStyle: 'bold',
        color: '#fff4d6',
      })
      .setOrigin(0, 0);
    this.eatenText.setDepth(50);
  }

  createTitle() {
    const centerX = this.scale.width / 2;
    this.destroyViews(this.titleViews);

    const title = this.add
      .text(centerX, 42, '! FISH FOOD !', {
        fontFamily: 'Arial',
        fontSize: '54px',
        fontStyle: 'bold',
        color: '#fff4d6',
        stroke: '#087fa8',
        strokeThickness: 6,
      })
      .setOrigin(0.5);

    const instruction = this.add
      .text(
        centerX,
        112,
        'Eat smaller fish to grow bigger!\n\n'
          + "Don't get eaten by bigger fish!\n\n"
          + 'Use the arrow keys to control movement',
        {
          fontFamily: 'Arial',
          fontSize: '25px',
          fontStyle: 'bold',
          color: '#087fa8',
          align: 'center',
          lineSpacing: 7,
        },
      )
      .setOrigin(0.5);

    const arrowKeys = this.add
      .text(centerX, 300, '  ▲\n◀ ▼ ▶', {
        fontFamily: 'Arial',
        fontSize: '32px',
        fontStyle: 'bold',
        color: '#087fa8',
        backgroundColor: '#fff4d6',
        align: 'center',
        padding: { x: 12, y: 7 },
      })
      .setOrigin(0.5);

    const detail = this.add
      .text(
        centerX,
        365,
        'The bigger the fish, the more you will grow,\nand the more points you will receive!',
        {
          fontFamily: 'Arial',
          fontSize: '22px',
          fontStyle: 'bold',
          color: '#087fa8',
          align: 'center',
          lineSpacing: 6,
        },
      )
      .setOrigin(0.5);

    const start = this.add
      .text(centerX, 445, 'PRESS ENTER, SPACE, OR AN ARROW KEY', {
        fontFamily: 'Arial',
        fontSize: '18px',
        fontStyle: 'bold',
        color: '#087fa8',
        align: 'center',
        backgroundColor: '#fff4d6',
        padding: { x: 10, y: 6 },
      })
      .setOrigin(0.5);

    this.titleViews = [title, instruction, arrowKeys, detail, start];
  }

  startRun() {
    this.destroyViews(this.titleViews);
    this.titleViews = [];
    this.destroyViews(this.endViews);
    this.endViews = [];
    transitionGameState(this.applicationState, 'start');

    if (this.player) {
      for (const view of this.fishViews.values()) {
        view.destroy();
      }
      this.player.destroy();
    }

    const { width, height } = this.scale;
    const pondBottom = height - gameConfig.pond.bottomInset;
    this.playerMovement = createPlayerMovement({
      x: width / 2,
      y: pondBottom / 2,
    });
    this.player = this.add.image(
      this.playerMovement.x,
      this.playerMovement.y,
      'player-fish',
    );
    this.runState = createRunState(gameConfig.player);
    this.player.setDisplaySize(
      this.runState.size,
      this.runState.size * 0.6,
    );
    this.player.setFlipX(true);

    this.fishPopulation = createFishPopulation(createSeededRandom(Date.now()));
    this.fishViews = new Map();
    if (!this.scoreText) {
      this.createHud();
    } else {
      this.scoreText.setVisible(true);
      this.eatenIcon.setVisible(true);
      this.eatenText.setVisible(true);
      this.updateHud();
    }
  }

  replayRun() {
    transitionGameState(this.applicationState, 'replay');
    this.startRun();
  }

  destroyViews(views) {
    for (const view of views) {
      if (view && view.destroy) {
        view.destroy();
      }
    }
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
    if (this.applicationState.status === GAME_STATES.title) {
      if (
        Phaser.Input.Keyboard.JustDown(this.enterKey) ||
        Phaser.Input.Keyboard.JustDown(this.spaceKey) ||
        Phaser.Input.Keyboard.JustDown(this.cursors.up) ||
        Phaser.Input.Keyboard.JustDown(this.cursors.down) ||
        Phaser.Input.Keyboard.JustDown(this.cursors.left) ||
        Phaser.Input.Keyboard.JustDown(this.cursors.right)
      ) {
        this.startRun();
      }
      return;
    }

    if (
      this.applicationState.status === GAME_STATES.gameOver ||
      this.applicationState.status === GAME_STATES.victory
    ) {
      if (
        Phaser.Input.Keyboard.JustDown(this.enterKey) ||
        Phaser.Input.Keyboard.JustDown(this.spaceKey) ||
        Phaser.Input.Keyboard.JustDown(this.cursors.up) ||
        Phaser.Input.Keyboard.JustDown(this.cursors.down) ||
        Phaser.Input.Keyboard.JustDown(this.cursors.left) ||
        Phaser.Input.Keyboard.JustDown(this.cursors.right)
      ) {
        this.replayRun();
      }
      return;
    }

    if (!this.player || !this.cursors || !this.fishPopulation) {
      return;
    }
    if (
      this.runState.status === 'dead' ||
      this.runState.status === 'victory'
    ) {
      return;
    }

    const { width, height } = this.scale;
    const pondBottom = height - gameConfig.pond.bottomInset;
    const elapsedSeconds = deltaMilliseconds / 1000;
    updateRunProgress(this.runState, elapsedSeconds);
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
    const eatenBefore = this.runState.eatenCount;
    resolveFishCollisions(
      this.playerMovement,
      this.runState,
      this.fishPopulation.fish,
      gameConfig.player,
    );

    if (this.runState.eatenCount > eatenBefore) {
      this.showEatingFeedback();
    }
    if (this.runState.status === 'dead') {
      this.highScores = saveHighScore(
        window.localStorage,
        this.runState.score,
      );
      this.showDeathFeedback();
      transitionGameState(this.applicationState, 'dead');
    } else if (
      this.runState.size >= gameConfig.player.maximumSize
    ) {
      this.highScores = saveHighScore(
        window.localStorage,
        this.runState.score,
      );
      this.runState.status = 'victory';
      this.showVictoryFeedback();
      transitionGameState(this.applicationState, 'victory');
    }

    this.player.setDisplaySize(this.runState.size, this.runState.size * 0.6);
    this.updateHud();
    this.updateFishViews();
  }

  updateHud() {
    this.scoreText.setText(formatScore(this.runState.score));
    this.eatenText.setText(String(this.runState.eatenCount));
  }

  showEatingFeedback() {
    const glow = this.add.circle(this.player.x, this.player.y, this.runState.size * 0.38, 0xfff2a6, 0.45);
    this.tweens.add({
      targets: glow,
      alpha: 0,
      scale: 1.5,
      duration: 180,
      onComplete: () => glow.destroy(),
    });
  }

  showDeathFeedback() {
    const overlay = this.add.rectangle(
      this.scale.width / 2,
      this.scale.height / 2,
      this.scale.width,
      this.scale.height,
      0x3b1f24,
      0.35,
    );
    overlay.setDepth(100);
    const title = this.add
      .text(this.scale.width / 2, 205, 'GAME OVER', {
        fontFamily: 'Arial',
        fontSize: '52px',
        fontStyle: 'bold',
        color: '#fff4d6',
      })
      .setOrigin(0.5)
      .setDepth(101);
    const finalScore = this.add
      .text(
        this.scale.width / 2,
        270,
        `Final score: ${formatScore(this.runState.score)}`,
        {
          fontFamily: 'Arial',
          fontSize: '26px',
          fontStyle: 'bold',
          color: '#fff4d6',
        },
      )
      .setOrigin(0.5)
      .setDepth(101);
    const highScore = this.add
      .text(
        this.scale.width / 2,
        320,
        `High score: ${formatScore(this.highScores[0] ?? 0)}`,
        {
          fontFamily: 'Arial',
          fontSize: '22px',
          fontStyle: 'bold',
          color: '#fff4d6',
        },
      )
      .setOrigin(0.5)
      .setDepth(101);
    const replay = this.add
      .text(
        this.scale.width / 2,
        380,
        'PRESS ENTER, SPACE, OR AN ARROW KEY TO REPLAY',
        {
          fontFamily: 'Arial',
          fontSize: '18px',
          fontStyle: 'bold',
          color: '#fff4d6',
          backgroundColor: '#087fa8',
          padding: { x: 10, y: 6 },
        },
      )
      .setOrigin(0.5)
      .setDepth(101);
    this.endViews = [overlay, title, finalScore, highScore, replay];
  }

  showVictoryFeedback() {
    const overlay = this.add.rectangle(
      this.scale.width / 2,
      this.scale.height / 2,
      this.scale.width,
      this.scale.height,
      0x087fa8,
      0.88,
    );
    overlay.setDepth(100);
    const title = this.add
      .text(this.scale.width / 2, 150, 'THE POND IS DEFEATED', {
        fontFamily: 'Arial',
        fontSize: '44px',
        fontStyle: 'bold',
        color: '#fff4d6',
      })
      .setOrigin(0.5)
      .setDepth(101);
    const ending = this.add
      .text(
        this.scale.width / 2,
        260,
        'You ate everything and completely destroyed\nthe pond eco-system.',
        {
          fontFamily: 'Arial',
          fontSize: '28px',
          fontStyle: 'bold',
          color: '#fff4d6',
          align: 'center',
          lineSpacing: 8,
        },
      )
      .setOrigin(0.5)
      .setDepth(101);
    const score = this.add
      .text(
        this.scale.width / 2,
        350,
        `Final score: ${formatScore(this.runState.score)}`,
        {
          fontFamily: 'Arial',
          fontSize: '24px',
          fontStyle: 'bold',
          color: '#fff4d6',
        },
      )
      .setOrigin(0.5)
      .setDepth(101);
    const replay = this.add
      .text(
        this.scale.width / 2,
        410,
        'PRESS ENTER, SPACE, OR AN ARROW KEY TO REPLAY',
        {
          fontFamily: 'Arial',
          fontSize: '18px',
          fontStyle: 'bold',
          color: '#087fa8',
          backgroundColor: '#fff4d6',
          padding: { x: 10, y: 6 },
        },
      )
      .setOrigin(0.5)
      .setDepth(101);
    this.endViews = [overlay, title, ending, score, replay];
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
