import { describe, expect, it } from 'vitest';
import { createPlayerMovement, updatePlayerMovement } from './playerMovement.js';

const config = {
  acceleration: 900,
  maximumSpeed: 220,
  drag: 3.5,
};

const bounds = {
  left: 0,
  right: 960,
  top: 0,
  bottom: 484,
  radius: 34,
};

function advance(state, input, seconds = 0.1, steps = 1) {
  let result = state;
  for (let index = 0; index < steps; index += 1) {
    result = updatePlayerMovement(result, input, seconds, config, bounds);
  }
  return result;
}

describe('player movement', () => {
  it('accelerates in the expected direction', () => {
    const state = advance(createPlayerMovement(), { right: true });
    expect(state.velocityX).toBeGreaterThan(0);
    expect(state.velocityY).toBe(0);
  });

  it('preserves momentum and decelerates after input stops', () => {
    const moving = advance(createPlayerMovement(), { right: true }, 0.1, 5);
    const stopped = advance(moving, {}, 0.1, 1);
    expect(stopped.velocityX).toBeGreaterThan(0);
    expect(stopped.velocityX).toBeLessThan(moving.velocityX);
  });

  it('allows opposite input to counter existing momentum', () => {
    const moving = advance(createPlayerMovement(), { right: true }, 0.1, 5);
    const countered = advance(moving, { left: true }, 0.1, 5);
    expect(countered.velocityX).toBeLessThan(moving.velocityX);
  });

  it('respects maximum speed', () => {
    const state = advance(createPlayerMovement(), { right: true }, 0.1, 100);
    expect(Math.hypot(state.velocityX, state.velocityY)).toBeLessThanOrEqual(
      config.maximumSpeed,
    );
  });

  it('normalises diagonal movement', () => {
    const diagonal = advance(createPlayerMovement(), { right: true, down: true }, 0.1, 5);
    expect(Math.hypot(diagonal.velocityX, diagonal.velocityY)).toBeLessThanOrEqual(
      config.maximumSpeed,
    );
  });

  it('wraps at both horizontal edges', () => {
    const fromLeft = updatePlayerMovement(
      { x: -34, y: 270, velocityX: -220, velocityY: 0 },
      {},
      0.1,
      config,
      bounds,
    );
    expect(fromLeft.x).toBeGreaterThan(bounds.right);

    const fromRight = updatePlayerMovement(
      { x: 994, y: 270, velocityX: 220, velocityY: 0 },
      {},
      0.1,
      config,
      bounds,
    );
    expect(fromRight.x).toBeLessThan(bounds.left);
  });

  it('keeps the player within vertical boundaries', () => {
    const top = advance(createPlayerMovement({ x: 480, y: 34 }), { up: true }, 0.1, 20);
    expect(top.y).toBeGreaterThanOrEqual(bounds.top + bounds.radius);

    const bottom = advance(createPlayerMovement({ x: 480, y: 450 }), { down: true }, 0.1, 20);
    expect(bottom.y).toBeLessThanOrEqual(bounds.bottom - bounds.radius);
  });

  it('produces frame-rate-consistent movement', () => {
    let coarse = createPlayerMovement();
    let fine = createPlayerMovement();
    coarse = advance(coarse, { right: true, down: true }, 0.1, 10);

    for (let index = 0; index < 100; index += 1) {
      fine = updatePlayerMovement(fine, { right: true, down: true }, 0.01, config, bounds);
    }

    expect(coarse.x).toBeCloseTo(fine.x, -1);
    expect(coarse.y).toBeCloseTo(fine.y, -1);
  });
});
