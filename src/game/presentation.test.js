import { describe, expect, it } from 'vitest';
import { gameConfig } from '../config/game.js';
import { createRunState, resolveFishCollisions } from './foodChain.js';
import {
  clampFrameSeconds,
  createFocusPause,
  findMissingTextureKeys,
  focusGained,
  focusLost,
  growthPulseScale,
  inputReceived,
  phaseForId,
  resetFocusPause,
  swimWiggle,
} from './presentation.js';

const wiggle = gameConfig.presentation.swimWiggle;
const pulse = gameConfig.presentation.growthPulse;

describe('swim animation', () => {
  it('stays within the configured amplitude for every size', () => {
    for (const size of [16, 24, 36, 64, 120, 176]) {
      for (let time = 0; time < 5; time += 0.037) {
        const result = swimWiggle(time, 7, size, wiggle);
        expect(Math.abs(result.scaleX - 1)).toBeLessThanOrEqual(wiggle.amplitude + 1e-9);
        expect(Math.abs(result.scaleY - 1)).toBeLessThanOrEqual(wiggle.amplitude + 1e-9);
        expect(Math.abs(result.angleDegrees)).toBeLessThanOrEqual(wiggle.angleDegrees + 1e-9);
      }
    }
  });

  it('keeps the smallest fish more still than large fish', () => {
    const peak = (size) => {
      let max = 0;
      for (let time = 0; time < 2; time += 0.01) {
        max = Math.max(max, Math.abs(swimWiggle(time, 3, size, wiggle).scaleX - 1));
      }
      return max;
    };

    expect(peak(16)).toBeLessThan(peak(120));
    expect(peak(16)).toBeGreaterThan(0);
  });

  it('is deterministic for the same time, id, and size', () => {
    expect(swimWiggle(1.234, 5, 40, wiggle)).toEqual(swimWiggle(1.234, 5, 40, wiggle));
  });

  it('desynchronises different fish', () => {
    expect(phaseForId(1)).not.toBe(phaseForId(2));
    expect(swimWiggle(0.5, 1, 60, wiggle).scaleX).not.toBe(swimWiggle(0.5, 2, 60, wiggle).scaleX);
  });
});

describe('growth pulse', () => {
  it('is neutral before, after, and for invalid times', () => {
    expect(growthPulseScale(-1, pulse)).toBe(1);
    expect(growthPulseScale(pulse.durationMs, pulse)).toBe(1);
    expect(growthPulseScale(pulse.durationMs * 3, pulse)).toBe(1);
    expect(growthPulseScale(Number.NaN, pulse)).toBe(1);
  });

  it('peaks at the configured scale mid-pulse and never exceeds it', () => {
    expect(growthPulseScale(pulse.durationMs / 2, pulse)).toBeCloseTo(pulse.scale, 6);
    for (let time = 0; time < pulse.durationMs; time += 3) {
      const value = growthPulseScale(time, pulse);
      expect(value).toBeGreaterThanOrEqual(1);
      expect(value).toBeLessThanOrEqual(pulse.scale + 1e-9);
    }
  });
});

describe('presentation does not alter gameplay values', () => {
  it('collision outcomes depend only on gameplay size, never on animation', () => {
    const player = { x: 100, y: 100 };
    const prey = { id: 1, x: 120, y: 100, size: 20 };

    const baseline = createRunState(gameConfig.player);
    resolveFishCollisions(player, baseline, [{ ...prey }], gameConfig.player);

    // Apply an extreme presentation pulse and wiggle; gameplay inputs stay
    // the same, so the result must be identical.
    growthPulseScale(pulse.durationMs / 2, pulse);
    swimWiggle(0.3, prey.id, prey.size, wiggle);
    const animated = createRunState(gameConfig.player);
    resolveFishCollisions(player, animated, [{ ...prey }], gameConfig.player);

    expect(animated).toEqual(baseline);
    expect(animated.size).toBe(gameConfig.player.initialSize + gameConfig.player.growthPerMeal);
  });

  it('presentation helpers take no gameplay state and mutate none', () => {
    const run = createRunState(gameConfig.player);
    const snapshot = JSON.stringify(run);
    swimWiggle(1, 1, run.size, wiggle);
    growthPulseScale(50, pulse);

    expect(JSON.stringify(run)).toBe(snapshot);
  });
});

describe('frame delta clamp', () => {
  it('passes normal frames through and caps long stalls', () => {
    expect(clampFrameSeconds(16, 0.1)).toBeCloseTo(0.016, 6);
    expect(clampFrameSeconds(5000, 0.1)).toBe(0.1);
  });

  it('rejects invalid deltas', () => {
    expect(clampFrameSeconds(-5, 0.1)).toBe(0);
    expect(clampFrameSeconds(Number.NaN, 0.1)).toBe(0);
    expect(clampFrameSeconds(Infinity, 0.1)).toBe(0);
  });
});

describe('missing asset detection', () => {
  it('reports only the keys that failed to load', () => {
    const loaded = new Set(['player-fish', 'fish-blue']);
    const missing = findMissingTextureKeys(
      ['player-fish', 'fish-blue', 'fish-gold'],
      (key) => loaded.has(key),
    );

    expect(missing).toEqual(['fish-gold']);
  });

  it('treats a throwing lookup as missing instead of crashing', () => {
    const missing = findMissingTextureKeys(['a'], () => {
      throw new Error('bad texture manager');
    });

    expect(missing).toEqual(['a']);
  });

  it('reports nothing when every asset loaded', () => {
    expect(findMissingTextureKeys(['a', 'b'], () => true)).toEqual([]);
  });
});

describe('focus handling', () => {
  it('pauses a live run when focus is lost', () => {
    const pause = createFocusPause();
    focusLost(pause, true);

    expect(pause.paused).toBe(true);
  });

  it('does not pause outside a live run', () => {
    const pause = createFocusPause();
    focusLost(pause, false);

    expect(pause.paused).toBe(false);
  });

  it('stays paused on focus return until the player gives input', () => {
    const pause = createFocusPause();
    focusLost(pause, true);

    expect(inputReceived(pause)).toBe(false);
    expect(pause.paused).toBe(true);

    focusGained(pause);
    expect(pause.paused).toBe(true);
    expect(inputReceived(pause)).toBe(true);
    expect(pause.paused).toBe(false);
    expect(inputReceived(pause)).toBe(false);
  });

  it('losing focus again before resuming requires fresh input', () => {
    const pause = createFocusPause();
    focusLost(pause, true);
    focusGained(pause);
    focusLost(pause, true);

    expect(inputReceived(pause)).toBe(false);
    expect(pause.paused).toBe(true);
  });

  it('can be reset when a new run begins', () => {
    const pause = createFocusPause();
    focusLost(pause, true);
    resetFocusPause(pause);

    expect(pause).toEqual({ paused: false, focusReturned: false });
  });
});
