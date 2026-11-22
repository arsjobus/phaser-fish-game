import Phaser from 'phaser';
import { gameConfig } from '../config/game.js';
import {
  createFishPopulation,
  createSeededRandom,
  updateFishPopulation,
} from '../game/fishPopulation.js';
import { updateRunProgress } from '../game/runProgress.js';
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
import { createAudioController } from '../game/audioController.js';
import {
  clampFrameSeconds,
  createFocusPause,
  findMissingTextureKeys,
  focusGained,
  focusLost,
  growthPulseScale,
  inputReceived,
  resetFocusPause,
  swimWiggle,
} from '../game/presentation.js';
import { createSynthBackend } from '../audio/synthBackend.js';
import { createPondBackdrop } from '../presentation/pondBackdrop.js';
import {
  buildGameOverScreen,
  buildHud,
  buildPauseOverlay,
  buildSoundControls,
  buildTitleScreen,
  buildVictoryScreen,
  updateHud,
} from '../presentation/screens.js';

const PLAYER_TEXTURE = 'player-fish';
const FISH_ASPECT = 0.6;

function fishTextureKey(variantIndex) {
  return `fish-${gameConfig.fishPopulation.visualVariants[variantIndex]}`;
}

export class FoundationScene extends Phaser.Scene {
  constructor() {
    super('Foundation');
  }

  preload() {
    // Phaser's SVG processing throws on files that are not valid SVG, which
    // would stall the loader. Route that into its normal error path so the
    // game starts and a fallback texture is drawn instead.
    this.load.on(Phaser.Loader.Events.ADD, (_key, type, _loader, file) => {
      if (type !== 'svg') return;
      const process = file.onProcess.bind(file);
      file.onProcess = () => {
        try {
          process();
        } catch (error) {
          file.onProcessError();
        }
      };
    });

    // Rasterise the SVGs well above their display size so the largest fish
    // (176px) stays crisp.
    const raster = { width: 300, height: 180 };
    const base = import.meta.env.BASE_URL;
    this.load.svg(PLAYER_TEXTURE, `${base}assets/player-fish.svg`, raster);
    gameConfig.fishPopulation.visualVariants.forEach((variant) => {
      this.load.svg(`fish-${variant}`, `${base}assets/fish-${variant}.svg`, raster);
    });
    // A missing or corrupt asset must not stop the game; fallbacks are made in
    // create() for any texture that did not load.
  }

  create() {
    this.ensureFishTextures();
    this.backdrop = createPondBackdrop(this);

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
    this.fishViews = new Map();
    this.eatenIdsThisFrame = new Set();
    this.pulseStartedAt = -Infinity;
    this.hud = null;

    this.audio = createAudioController(
      createSynthBackend(window),
      gameConfig.audio,
    );
    this.soundControls = buildSoundControls(this, this.audio);

    this.focusPause = createFocusPause();
    this.pauseOverlay = buildPauseOverlay(this);
    this.pauseOverlay.setVisible(false);
    this.registerInputHandlers();

    this.titleViews = buildTitleScreen(this);
  }

  // Draws a simple stand-in for any fish texture that failed to load, so a
  // missing asset degrades to a plain coloured fish instead of a crash.
  ensureFishTextures() {
    const colors = gameConfig.presentation.fallbackColors;
    const required = [
      PLAYER_TEXTURE,
      ...gameConfig.fishPopulation.visualVariants.map((variant) => `fish-${variant}`),
    ];
    const missing = findMissingTextureKeys(required, (key) => this.textures.exists(key));
    missing.forEach((key) => {
      const name = key === PLAYER_TEXTURE ? 'player' : key.replace(/^fish-/, '');
      const color = colors[name] ?? 0x888888;
      const graphics = this.make.graphics({ x: 0, y: 0, add: false });
      graphics.fillStyle(color, 1);
      graphics.fillEllipse(130, 90, 200, 120);
      graphics.fillTriangle(30, 90, 0, 40, 0, 140);
      graphics.fillStyle(0xfff5df, 1);
      graphics.fillCircle(210, 75, 20);
      graphics.fillStyle(0x182a3a, 1);
      graphics.fillCircle(216, 78, 10);
      graphics.generateTexture(key, 300, 180);
      graphics.destroy();
    });
  }

  registerInputHandlers() {
    this.input.keyboard.on('keydown', (event) => {
      if (event.code === 'KeyM') {
        this.audio.resume();
        this.audio.toggleMuteAll();
        this.soundControls.refresh();
        return;
      }
      this.audio.resume();
      this.resumeFromFocusPause();
    });
    this.input.on('pointerdown', () => {
      this.audio.resume();
      this.resumeFromFocusPause();
    });

    const lost = () => this.handleFocusLost();
    const gained = () => this.handleFocusGained();
    const events = this.game.events;
    events.on(Phaser.Core.Events.BLUR, lost);
    events.on(Phaser.Core.Events.HIDDEN, lost);
    events.on(Phaser.Core.Events.FOCUS, gained);
    events.on(Phaser.Core.Events.VISIBLE, gained);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      events.off(Phaser.Core.Events.BLUR, lost);
      events.off(Phaser.Core.Events.HIDDEN, lost);
      events.off(Phaser.Core.Events.FOCUS, gained);
      events.off(Phaser.Core.Events.VISIBLE, gained);
    });
  }

  handleFocusLost() {
    // Drop held keys so a key released while unfocused is not "stuck".
    this.input.keyboard.resetKeys();
    this.audio.suspend();
    const playing = this.applicationState.status === GAME_STATES.playing;
    focusLost(this.focusPause, playing);
    if (this.focusPause.paused) {
      this.pauseOverlay.setReady(false);
      this.pauseOverlay.setVisible(true);
    }
  }

  handleFocusGained() {
    this.input.keyboard.resetKeys();
    this.audio.resume();
    focusGained(this.focusPause);
    if (this.focusPause.paused) {
      this.pauseOverlay.setReady(true);
    }
  }

  resumeFromFocusPause() {
    if (inputReceived(this.focusPause)) {
      this.input.keyboard.resetKeys();
      this.pauseOverlay.setVisible(false);
    }
  }

  anyStartKeyPressed() {
    return (
      Phaser.Input.Keyboard.JustDown(this.enterKey) ||
      Phaser.Input.Keyboard.JustDown(this.spaceKey) ||
      Phaser.Input.Keyboard.JustDown(this.cursors.up) ||
      Phaser.Input.Keyboard.JustDown(this.cursors.down) ||
      Phaser.Input.Keyboard.JustDown(this.cursors.left) ||
      Phaser.Input.Keyboard.JustDown(this.cursors.right)
    );
  }

  startRun() {
    this.destroyViews(this.titleViews);
    this.titleViews = [];
    this.destroyViews(this.endViews);
    this.endViews = [];
    transitionGameState(this.applicationState, 'start');
    resetFocusPause(this.focusPause);
    this.pauseOverlay.setVisible(false);

    if (this.player) {
      for (const view of this.fishViews.values()) {
        view.destroy();
      }
      this.tweens.killTweensOf(this.player);
      this.player.destroy();
    }

    const { width, height } = this.scale;
    const pondBottom = height - gameConfig.pond.bottomInset;
    this.playerMovement = createPlayerMovement({
      x: width / 2,
      y: pondBottom / 2,
    });
    this.player = this.add
      .image(this.playerMovement.x, this.playerMovement.y, PLAYER_TEXTURE)
      .setDepth(5);
    this.runState = createRunState(gameConfig.player);
    this.pulseStartedAt = -Infinity;
    this.applyPlayerTransform(0);
    this.player.setFlipX(true);

    this.fishPopulation = createFishPopulation(createSeededRandom(Date.now()));
    this.fishViews = new Map();
    this.eatenIdsThisFrame = new Set();
    if (!this.hud) {
      this.hud = buildHud(this);
    } else {
      this.hud.score.setVisible(true);
      this.hud.eatenIcon.setVisible(true);
      this.hud.eatenText.setVisible(true);
    }
    updateHud(this.hud, this.runState);

    this.audio.resume();
    this.audio.startMusic();
  }

  replayRun() {
    transitionGameState(this.applicationState, 'replay');
    this.startRun();
  }

  destroyViews(views) {
    for (const view of views) {
      if (view && view.destroy) {
        this.tweens.killTweensOf(view);
        view.destroy();
      }
    }
  }

  update(time, deltaMilliseconds) {
    this.audio.update();

    if (this.applicationState.status === GAME_STATES.title) {
      if (this.anyStartKeyPressed()) {
        this.startRun();
      }
      return;
    }

    if (
      this.applicationState.status === GAME_STATES.gameOver ||
      this.applicationState.status === GAME_STATES.victory
    ) {
      if (this.anyStartKeyPressed()) {
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
    if (this.focusPause.paused) {
      return;
    }

    const { width, height } = this.scale;
    const pondBottom = height - gameConfig.pond.bottomInset;
    const elapsedSeconds = clampFrameSeconds(
      deltaMilliseconds,
      gameConfig.presentation.maxFrameSeconds,
    );
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
    const idsBefore = this.fishPopulation.fish.map((fish) => fish.id);
    resolveFishCollisions(
      this.playerMovement,
      this.runState,
      this.fishPopulation.fish,
      gameConfig.player,
    );

    this.eatenIdsThisFrame = new Set();
    if (this.runState.eatenCount > eatenBefore) {
      const remaining = new Set(this.fishPopulation.fish.map((fish) => fish.id));
      idsBefore.forEach((id) => {
        if (!remaining.has(id)) this.eatenIdsThisFrame.add(id);
      });
      this.showEatingFeedback();
      this.audio.playEffect('eat');
    }

    if (this.runState.status === 'dead') {
      this.highScores = saveHighScore(window.localStorage, this.runState.score);
      this.showDeathFeedback();
      transitionGameState(this.applicationState, 'dead');
    } else if (this.runState.size >= gameConfig.player.maximumSize) {
      this.highScores = saveHighScore(window.localStorage, this.runState.score);
      this.runState.status = 'victory';
      this.showVictoryFeedback();
      transitionGameState(this.applicationState, 'victory');
    }

    this.applyPlayerTransform(time / 1000);
    updateHud(this.hud, this.runState);
    this.updateFishViews(time / 1000);
  }

  // Display-only transform. Size, wiggle, and pulse change how the fish is
  // drawn; collision always uses the gameplay size in `runState`.
  applyPlayerTransform(timeSeconds) {
    const size = this.runState.size;
    const wiggle = swimWiggle(timeSeconds, 0, size, gameConfig.presentation.swimWiggle);
    const pulse = growthPulseScale(
      this.time.now - this.pulseStartedAt,
      gameConfig.presentation.growthPulse,
    );
    this.player.setDisplaySize(
      size * wiggle.scaleX * pulse,
      size * FISH_ASPECT * wiggle.scaleY * pulse,
    );
    this.player.setAngle(wiggle.angleDegrees);
  }

  showEatingFeedback() {
    this.pulseStartedAt = this.time.now;
    const glow = this.add
      .circle(this.player.x, this.player.y, this.runState.size * 0.38, 0xfff2a6, 0.45)
      .setDepth(4);
    this.tweens.add({
      targets: glow,
      alpha: 0,
      scale: 1.5,
      duration: 180,
      onComplete: () => glow.destroy(),
    });
  }

  showDeathFeedback() {
    this.audio.stopMusic();
    this.audio.playEffect('death');
    this.player.setTint(0xff7777);
    this.tweens.add({
      targets: this.player,
      alpha: 0.35,
      duration: 450,
      ease: 'Sine.easeOut',
    });
    this.cameras.main.shake(140, 0.004);
    this.endViews = buildGameOverScreen(this, {
      score: this.runState.score,
      highScore: this.highScores[0] ?? 0,
    });
  }

  showVictoryFeedback() {
    this.audio.stopMusic();
    this.audio.playEffect('victory');
    this.endViews = buildVictoryScreen(this, { score: this.runState.score });
  }

  updateFishViews(timeSeconds) {
    const fishIds = new Set(this.fishPopulation.fish.map((fish) => fish.id));
    for (const [id, view] of this.fishViews) {
      if (fishIds.has(id)) continue;
      this.fishViews.delete(id);
      if (this.eatenIdsThisFrame.has(id) && this.player) {
        // Brief swallow: the prey is drawn into the player and shrinks away.
        this.tweens.add({
          targets: view,
          x: this.player.x,
          y: this.player.y,
          scaleX: 0,
          scaleY: 0,
          alpha: 0,
          duration: 140,
          ease: 'Sine.easeIn',
          onComplete: () => view.destroy(),
        });
      } else {
        view.destroy();
      }
    }

    for (const fish of this.fishPopulation.fish) {
      let view = this.fishViews.get(fish.id);
      if (!view) {
        view = this.add.image(fish.x, fish.y, fishTextureKey(fish.variant));
        this.fishViews.set(fish.id, view);
      }

      const wiggle = swimWiggle(
        timeSeconds,
        fish.id,
        fish.size,
        gameConfig.presentation.swimWiggle,
      );
      view.setPosition(fish.x, fish.y);
      view.setDisplaySize(
        fish.size * wiggle.scaleX,
        fish.size * FISH_ASPECT * wiggle.scaleY,
      );
      view.setAngle(wiggle.angleDegrees);
      view.setFlipX(fish.direction < 0);
    }
  }
}
