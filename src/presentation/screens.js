import { formatScore } from '../game/runProgress.js';

const FONT = 'Arial, Helvetica, sans-serif';
const CREAM = '#fff4d6';
const CREAM_HEX = 0xfff4d6;
const BLUE = '#087fa8';
const BLUE_HEX = 0x087fa8;
const DEEP = '#0a4f6b';

export const SCREEN_DEPTH = Object.freeze({
  title: 20,
  hud: 50,
  controls: 60,
  endOverlay: 100,
  endContent: 101,
  pause: 200,
});

function panel(scene, x, y, width, height, depth, alpha = 0.94) {
  const graphics = scene.add.graphics().setDepth(depth);
  graphics.fillStyle(0x053a50, 0.28);
  graphics.fillRoundedRect(x + 4, y + 6, width, height, 22);
  graphics.fillStyle(CREAM_HEX, alpha);
  graphics.fillRoundedRect(x, y, width, height, 22);
  graphics.lineStyle(4, BLUE_HEX, 1);
  graphics.strokeRoundedRect(x, y, width, height, 22);
  return graphics;
}

function wordmark(scene, x, y, text, size, depth) {
  return scene.add
    .text(x, y, text, {
      fontFamily: 'Arial Black, Arial, sans-serif',
      fontSize: `${size}px`,
      fontStyle: 'bold',
      color: '#ff8a1f',
      stroke: '#7a2a08',
      strokeThickness: Math.round(size * 0.16),
    })
    .setShadow(0, Math.round(size * 0.07), '#053a50', 0, true, true)
    .setOrigin(0.5)
    .setDepth(depth);
}

export function fadeIn(scene, view, toAlpha = 1, durationMs = 260) {
  view.setAlpha(0);
  scene.tweens.add({ targets: view, alpha: toAlpha, duration: durationMs, ease: 'Sine.easeOut' });
}

export function buildTitleScreen(scene) {
  const centerX = scene.scale.width / 2;
  const depth = SCREEN_DEPTH.title;
  const views = [];

  const title = wordmark(scene, centerX, 56, '! FISH FOOD !', 62, depth + 1);
  scene.tweens.add({
    targets: title,
    y: title.y + 5,
    duration: 1400,
    ease: 'Sine.easeInOut',
    yoyo: true,
    repeat: -1,
  });
  views.push(title);

  views.push(panel(scene, 130, 100, 700, 316, depth));

  const decorativePlayer = scene.add
    .image(72, 250, 'player-fish')
    .setDisplaySize(112, 67)
    .setFlipX(true)
    .setDepth(depth);
  const decorativePrey = scene.add
    .image(888, 300, 'fish-blue')
    .setDisplaySize(112, 67)
    .setFlipX(true)
    .setDepth(depth);
  [decorativePlayer, decorativePrey].forEach((fish, index) => {
    scene.tweens.add({
      targets: fish,
      y: fish.y + (index === 0 ? -12 : 12),
      duration: 1800 + index * 300,
      ease: 'Sine.easeInOut',
      yoyo: true,
      repeat: -1,
    });
  });
  views.push(decorativePlayer, decorativePrey);

  views.push(
    scene.add
      .text(
        centerX,
        178,
        'Eat smaller fish to grow bigger!\n'
          + "Don't get eaten by bigger fish!\n"
          + 'Use the arrow keys to control movement',
        {
          fontFamily: FONT,
          fontSize: '24px',
          fontStyle: 'bold',
          color: BLUE,
          align: 'center',
          lineSpacing: 12,
        },
      )
      .setOrigin(0.5)
      .setDepth(depth + 1),
  );

  views.push(
    scene.add
      .text(centerX, 292, '  ▲\n◀ ▼ ▶', {
        fontFamily: FONT,
        fontSize: '30px',
        fontStyle: 'bold',
        color: CREAM,
        backgroundColor: BLUE,
        align: 'center',
        padding: { x: 14, y: 8 },
      })
      .setOrigin(0.5)
      .setDepth(depth + 1),
  );

  views.push(
    scene.add
      .text(
        centerX,
        374,
        'The bigger the fish, the more you will grow,\nand the more points you will receive!',
        {
          fontFamily: FONT,
          fontSize: '21px',
          fontStyle: 'bold',
          color: BLUE,
          align: 'center',
          lineSpacing: 6,
        },
      )
      .setOrigin(0.5)
      .setDepth(depth + 1),
  );

  const start = scene.add
    .text(centerX, 458, 'PRESS ENTER, SPACE, OR AN ARROW KEY', {
      fontFamily: FONT,
      fontSize: '19px',
      fontStyle: 'bold',
      color: CREAM,
      backgroundColor: DEEP,
      padding: { x: 14, y: 8 },
    })
    .setOrigin(0.5)
    .setDepth(depth + 1);
  scene.tweens.add({
    targets: start,
    alpha: 0.55,
    duration: 700,
    ease: 'Sine.easeInOut',
    yoyo: true,
    repeat: -1,
  });
  views.push(start);

  return views;
}

const HUD_TEXT = Object.freeze({
  fontFamily: FONT,
  fontStyle: 'bold',
  color: CREAM,
  stroke: DEEP,
  strokeThickness: 5,
});

export function buildHud(scene) {
  const score = scene.add
    .text(scene.scale.width / 2, 14, '0', { ...HUD_TEXT, fontSize: '28px' })
    .setOrigin(0.5, 0)
    .setDepth(SCREEN_DEPTH.hud);
  const eatenIcon = scene.add
    .image(18, 26, 'player-fish')
    .setDisplaySize(30, 18)
    .setOrigin(0, 0.5)
    .setFlipX(true)
    .setDepth(SCREEN_DEPTH.hud);
  const eatenText = scene.add
    .text(56, 14, '0', { ...HUD_TEXT, fontSize: '22px' })
    .setOrigin(0, 0)
    .setDepth(SCREEN_DEPTH.hud);
  return { score, eatenIcon, eatenText };
}

export function updateHud(hud, runState) {
  hud.score.setText(formatScore(runState.score));
  hud.eatenText.setText(String(runState.eatenCount));
}

// Lower-left sound controls, drawn over the sandy floor. Each button is a
// plain toggle; the labels always show the current state.
export function buildSoundControls(scene, audio) {
  const y = scene.scale.height - 34;
  const style = {
    fontFamily: FONT,
    fontSize: '14px',
    fontStyle: 'bold',
    color: CREAM,
    backgroundColor: '#6b5530',
    padding: { x: 9, y: 5 },
  };
  const label = (name, on) => `${name}: ${on ? 'ON' : 'OFF'}`;

  const music = scene.add.text(14, y, label('MUSIC', true), style)
    .setOrigin(0, 0).setDepth(SCREEN_DEPTH.controls);
  const effects = scene.add.text(120, y, label('SOUND FX', true), style)
    .setOrigin(0, 0).setDepth(SCREEN_DEPTH.controls);
  const hint = scene.add
    .text(246, y + 5, 'M = mute all', {
      fontFamily: FONT,
      fontSize: '13px',
      fontStyle: 'bold',
      color: '#6b5530',
    })
    .setOrigin(0, 0)
    .setDepth(SCREEN_DEPTH.controls);

  const refresh = () => {
    music.setText(label('MUSIC', audio.state.musicEnabled));
    effects.setText(label('SOUND FX', audio.state.effectsEnabled));
    music.setAlpha(audio.state.musicEnabled ? 1 : 0.7);
    effects.setAlpha(audio.state.effectsEnabled ? 1 : 0.7);
  };

  const wire = (button, toggle) => {
    button.setInteractive({ useHandCursor: true });
    button.on('pointerdown', () => {
      audio.resume();
      toggle();
      refresh();
    });
  };
  wire(music, () => audio.toggleMusic());
  wire(effects, () => audio.toggleEffects());

  if (!audio.isAvailable) {
    hint.setText('(audio unavailable)');
    music.setAlpha(0.5);
    effects.setAlpha(0.5);
  }

  refresh();
  return { views: [music, effects, hint], refresh };
}

export function buildGameOverScreen(scene, { score, highScore }) {
  const { width, height } = scene.scale;
  const centerX = width / 2;
  const views = [];

  const overlay = scene.add
    .rectangle(centerX, height / 2, width, height, 0x3b1f24, 1)
    .setDepth(SCREEN_DEPTH.endOverlay);
  fadeIn(scene, overlay, 0.4, 320);
  views.push(overlay);

  const card = panel(scene, 270, 150, 420, 270, SCREEN_DEPTH.endContent);
  fadeIn(scene, card, 1, 320);
  views.push(card);

  const title = wordmark(scene, centerX, 208, 'GAME OVER', 50, SCREEN_DEPTH.endContent + 1);
  fadeIn(scene, title, 1, 320);
  views.push(title);

  const lines = [
    scene.add
      .text(centerX, 272, `Final score: ${formatScore(score)}`, {
        fontFamily: FONT, fontSize: '26px', fontStyle: 'bold', color: BLUE,
      })
      .setOrigin(0.5)
      .setDepth(SCREEN_DEPTH.endContent + 1),
    scene.add
      .text(centerX, 316, `High score: ${formatScore(highScore)}`, {
        fontFamily: FONT, fontSize: '21px', fontStyle: 'bold', color: BLUE,
      })
      .setOrigin(0.5)
      .setDepth(SCREEN_DEPTH.endContent + 1),
    scene.add
      .text(centerX, 376, 'PRESS ENTER, SPACE, OR AN ARROW KEY\nTO REPLAY', {
        fontFamily: FONT,
        fontSize: '16px',
        fontStyle: 'bold',
        color: CREAM,
        backgroundColor: DEEP,
        align: 'center',
        padding: { x: 12, y: 7 },
      })
      .setOrigin(0.5)
      .setDepth(SCREEN_DEPTH.endContent + 1),
  ];
  lines.forEach((line) => fadeIn(scene, line, 1, 420));
  views.push(...lines);
  return views;
}

export function buildVictoryScreen(scene, { score }) {
  const { width, height } = scene.scale;
  const centerX = width / 2;
  const views = [];

  const overlay = scene.add
    .rectangle(centerX, height / 2, width, height, 0x087fa8, 1)
    .setDepth(SCREEN_DEPTH.endOverlay);
  fadeIn(scene, overlay, 0.9, 400);
  views.push(overlay);

  // Sparse rising bubbles: a quiet celebration that never covers the text.
  for (let index = 0; index < 14; index += 1) {
    const radius = 4 + (index % 4) * 3;
    const bubble = scene.add
      .circle(40 + index * 66, height + 20, radius, 0xffffff, 0.35)
      .setStrokeStyle(2, 0xffffff, 0.6)
      .setDepth(SCREEN_DEPTH.endOverlay + 0.5);
    scene.tweens.add({
      targets: bubble,
      y: -30,
      duration: 4200 + (index % 5) * 700,
      delay: index * 220,
      repeat: -1,
      ease: 'Sine.easeIn',
    });
    views.push(bubble);
  }

  const card = panel(scene, 150, 100, 660, 350, SCREEN_DEPTH.endContent);
  fadeIn(scene, card, 1, 400);
  views.push(card);

  const title = wordmark(scene, centerX, 170, 'THE POND IS DEFEATED', 42, SCREEN_DEPTH.endContent + 1);
  title.setScale(0.6);
  title.setAlpha(0);
  scene.tweens.add({
    targets: title,
    scale: 1,
    alpha: 1,
    duration: 520,
    ease: 'Back.easeOut',
  });
  views.push(title);

  const rest = [
    scene.add
      .text(centerX, 266, 'You ate everything and completely destroyed\nthe pond eco-system.', {
        fontFamily: FONT, fontSize: '27px', fontStyle: 'bold', color: BLUE,
        align: 'center', lineSpacing: 8,
      })
      .setOrigin(0.5)
      .setDepth(SCREEN_DEPTH.endContent + 1),
    scene.add
      .text(centerX, 348, `Final score: ${formatScore(score)}`, {
        fontFamily: FONT, fontSize: '24px', fontStyle: 'bold', color: BLUE,
      })
      .setOrigin(0.5)
      .setDepth(SCREEN_DEPTH.endContent + 1),
    scene.add
      .text(centerX, 396, 'PRESS ENTER, SPACE, OR AN ARROW KEY TO REPLAY', {
        fontFamily: FONT, fontSize: '16px', fontStyle: 'bold', color: CREAM,
        backgroundColor: DEEP, padding: { x: 12, y: 7 },
      })
      .setOrigin(0.5)
      .setDepth(SCREEN_DEPTH.endContent + 1),
  ];
  rest.forEach((view) => fadeIn(scene, view, 1, 520));
  views.push(...rest);
  return views;
}

export function buildPauseOverlay(scene) {
  const { width, height } = scene.scale;
  const overlay = scene.add
    .rectangle(width / 2, height / 2, width, height, 0x04202c, 0.6)
    .setDepth(SCREEN_DEPTH.pause);
  const heading = scene.add
    .text(width / 2, height / 2 - 24, 'PAUSED', {
      fontFamily: FONT, fontSize: '48px', fontStyle: 'bold', color: CREAM,
      stroke: DEEP, strokeThickness: 7,
    })
    .setOrigin(0.5)
    .setDepth(SCREEN_DEPTH.pause + 1);
  const detail = scene.add
    .text(width / 2, height / 2 + 32, '', {
      fontFamily: FONT, fontSize: '20px', fontStyle: 'bold', color: CREAM,
      stroke: DEEP, strokeThickness: 4,
    })
    .setOrigin(0.5)
    .setDepth(SCREEN_DEPTH.pause + 1);
  const views = [overlay, heading, detail];
  return {
    views,
    setReady(ready) {
      detail.setText(
        ready ? 'Press any key or click to resume' : 'Click the game window to continue',
      );
    },
    setVisible(visible) {
      views.forEach((view) => view.setVisible(visible));
    },
  };
}
