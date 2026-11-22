import { gameConfig } from '../config/game.js';

const DEPTH = Object.freeze({ plants: -20, sand: -10 });

function makeCanvasTexture(scene, key, width, height, draw) {
  if (scene.textures.exists(key)) {
    scene.textures.remove(key);
  }
  const texture = scene.textures.createCanvas(key, width, height);
  draw(texture.getContext(), width, height);
  texture.refresh();
  return texture;
}

function drawSeaweed(ctx, width, height, blades, color, highlight) {
  blades.forEach(({ x, lean, bladeHeight, bladeWidth }) => {
    const baseY = height;
    const topY = height - bladeHeight;
    ctx.beginPath();
    ctx.moveTo(x - bladeWidth, baseY);
    ctx.bezierCurveTo(
      x - bladeWidth + lean, baseY - bladeHeight * 0.35,
      x + lean * 1.8, baseY - bladeHeight * 0.65,
      x + lean * 0.6, topY,
    );
    ctx.bezierCurveTo(
      x + bladeWidth + lean * 2.2, baseY - bladeHeight * 0.62,
      x + bladeWidth + lean * 0.4, baseY - bladeHeight * 0.3,
      x + bladeWidth, baseY,
    );
    ctx.closePath();
    const gradient = ctx.createLinearGradient(0, baseY, 0, topY);
    gradient.addColorStop(0, color);
    gradient.addColorStop(1, highlight);
    ctx.fillStyle = gradient;
    ctx.fill();
  });
}

// Builds the water gradient, sandy bottom, and sparse swaying plants. The
// returned object lets the scene tear the decoration down if it ever needs to.
export function createPondBackdrop(scene) {
  const { width, height } = scene.scale;
  const inset = gameConfig.pond.bottomInset;
  const pondBottom = height - inset;
  const { water, sand } = gameConfig.presentation;

  // The water gradient is painted by the browser as the CSS background of a
  // transparent canvas. That is visually identical to drawing it in Phaser but
  // avoids a full-screen textured draw every frame, which is costly on
  // software or low-end GPUs. Colours still come from the central config.
  const canvas = scene.game.canvas;
  if (canvas) {
    canvas.style.background = `linear-gradient(to bottom, ${water.top}, ${water.bottom})`;
  }

  const sandHeight = inset + 22;
  makeCanvasTexture(scene, 'pond-sand', width, sandHeight, (ctx, w, h) => {
    const gradient = ctx.createLinearGradient(0, 0, 0, h);
    gradient.addColorStop(0, sand.top);
    gradient.addColorStop(1, sand.bottom);
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.moveTo(0, h);
    ctx.lineTo(0, 14);
    for (let x = 0; x <= w; x += 12) {
      const y = 12 + Math.sin(x * 0.011) * 7 + Math.sin(x * 0.037 + 1.3) * 3;
      ctx.lineTo(x, y);
    }
    ctx.lineTo(w, h);
    ctx.closePath();
    ctx.fill();

    // A handful of pebbles; deliberately sparse to keep the floor uncluttered.
    ctx.fillStyle = 'rgba(120, 92, 52, 0.45)';
    [[90, 40], [355, 52], [430, 36], [610, 48], [775, 38], [905, 54]].forEach(([x, y], index) => {
      ctx.beginPath();
      ctx.ellipse(x, y, 7 + (index % 3) * 2, 3 + (index % 2), 0, 0, Math.PI * 2);
      ctx.fill();
    });
  });
  const sandImage = scene.add
    .image(0, pondBottom - 14, 'pond-sand')
    .setOrigin(0, 0)
    .setDepth(DEPTH.sand);

  makeCanvasTexture(scene, 'seaweed-tall', 70, 120, (ctx, w, h) => {
    drawSeaweed(ctx, w, h, [
      { x: 22, lean: -10, bladeHeight: 112, bladeWidth: 6 },
      { x: 36, lean: 8, bladeHeight: 96, bladeWidth: 6 },
      { x: 50, lean: -6, bladeHeight: 78, bladeWidth: 5 },
    ], '#1f7a34', '#56c26a');
  });
  makeCanvasTexture(scene, 'seaweed-short', 56, 90, (ctx, w, h) => {
    drawSeaweed(ctx, w, h, [
      { x: 18, lean: 8, bladeHeight: 82, bladeWidth: 5 },
      { x: 34, lean: -8, bladeHeight: 66, bladeWidth: 5 },
    ], '#2a8c3d', '#6fd27c');
  });

  const plants = [
    { x: 105, key: 'seaweed-tall' },
    { x: 330, key: 'seaweed-short' },
    { x: 690, key: 'seaweed-tall' },
    { x: 870, key: 'seaweed-short' },
  ].map(({ x, key }, index) => {
    const plant = scene.add
      .image(x, pondBottom + 8, key)
      .setOrigin(0.5, 1)
      .setDepth(DEPTH.plants);
    plant.setAngle(-2.5);
    scene.tweens.add({
      targets: plant,
      angle: 2.5,
      duration: 2200 + index * 380,
      delay: index * 250,
      ease: 'Sine.easeInOut',
      yoyo: true,
      repeat: -1,
    });
    return plant;
  });

  return { sandImage, plants, pondBottom };
}
