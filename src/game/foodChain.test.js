import { describe, expect, it } from 'vitest';
import { createRunState, resolveFishCollisions } from './foodChain.js';

const config = {
  initialSize: 76,
  growthPerMeal: 4,
  scorePerFish: 10,
  collisionRadiusScale: 0.5,
  collisionAspectRatio: 0.6,
};

describe('food-chain collision resolution', () => {
  it('consumes a smaller fish exactly once and awards growth and score', () => {
    const run = createRunState(config);
    const fish = [{ id: 1, x: 100, y: 100, size: 40 }];

    resolveFishCollisions({ x: 100, y: 100 }, run, fish, config);
    resolveFishCollisions({ x: 100, y: 100 }, run, fish, config);

    expect(fish).toHaveLength(0);
    expect(run.eatenCount).toBe(1);
    expect(run.score).toBe(10);
    expect(run.size).toBe(80);
  });

  it('marks the player dead on contact with a larger fish', () => {
    const run = createRunState(config);
    const fish = [{ id: 1, x: 100, y: 100, size: 80 }];

    resolveFishCollisions({ x: 100, y: 100 }, run, fish, config);

    expect(run.status).toBe('dead');
    expect(run.eatenCount).toBe(0);
  });

  it('does not collide when flattened fish bodies are vertically separated', () => {
    const run = createRunState(config);
    const fish = [{ id: 1, x: 100, y: 160, size: 80 }];

    resolveFishCollisions({ x: 100, y: 100 }, run, fish, config);

    expect(run.status).toBe('playing');
    expect(fish).toHaveLength(1);
  });

  it('treats equal-size contact as dangerous', () => {
    const run = createRunState(config);
    const fish = [{ id: 1, x: 100, y: 100, size: 76 }];

    resolveFishCollisions({ x: 100, y: 100 }, run, fish, config);

    expect(run.status).toBe('dead');
  });

  it('resolves multiple overlaps deterministically and consumes each prey once', () => {
    const run = createRunState(config);
    const fish = [
      { id: 2, x: 100, y: 100, size: 50 },
      { id: 1, x: 100, y: 100, size: 30 },
    ];

    resolveFishCollisions({ x: 100, y: 100 }, run, fish, config);

    expect(fish).toEqual([]);
    expect(run.eatenCount).toBe(2);
    expect(run.score).toBe(20);
    expect(run.size).toBe(84);
  });

  it('does not award repeated results across repeated collision frames', () => {
    const run = createRunState(config);
    const fish = [{ id: 1, x: 100, y: 100, size: 20 }];

    resolveFishCollisions({ x: 100, y: 100 }, run, fish, config);
    resolveFishCollisions({ x: 100, y: 100 }, run, fish, config);

    expect(run.eatenCount).toBe(1);
    expect(run.score).toBe(10);
  });

  it('does not overlap when fish bodies are only separated', () => {
    const run = createRunState(config);
    const fish = [{ id: 1, x: 170, y: 100, size: 40 }];

    resolveFishCollisions({ x: 100, y: 100 }, run, fish, config);

    expect(fish).toHaveLength(1);
    expect(run.eatenCount).toBe(0);
  });

  it('detects tangency as contact', () => {
    const run = createRunState(config);
    const fish = [{ id: 1, x: 138, y: 100, size: 40 }];

    resolveFishCollisions({ x: 100, y: 100 }, run, fish, config);

    expect(fish).toHaveLength(0);
    expect(run.eatenCount).toBe(1);
  });

  it('clamps growth at the configured maximum size', () => {
    const run = createRunState({ ...config, initialSize: 172, maximumSize: 176 });
    const fish = [{ id: 1, x: 100, y: 100, size: 40 }];

    resolveFishCollisions({ x: 100, y: 100 }, run, fish, {
      ...config,
      maximumSize: 176,
    });

    expect(run.size).toBe(176);
  });
});
