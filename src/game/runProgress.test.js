import { describe, expect, it } from 'vitest';
import {
  calculateMealScore,
  createRunState,
  formatScore,
  getProgressionStage,
  resetRunState,
  updateRunProgress,
} from './runProgress.js';

const config = {
  initialSize: 36,
  startingScore: 0,
  scorePerFish: 10,
  maximumSize: 176,
};

describe('run progression', () => {
  it('starts with a clear default run state', () => {
    expect(createRunState(config)).toEqual({
      size: 36,
      eatenCount: 0,
      score: 0,
      elapsedSeconds: 0,
      status: 'playing',
    });
  });

  it('uses a fixed score reward and separates it from rendering', () => {
    expect(calculateMealScore({ size: 20 }, config)).toBe(10);
    expect(calculateMealScore({ size: 160 }, config)).toBe(10);
  });

  it('tracks run duration only for valid positive updates', () => {
    const run = createRunState(config);
    updateRunProgress(run, 1.25);
    updateRunProgress(run, 0);
    updateRunProgress(run, Number.NaN);

    expect(run.elapsedSeconds).toBe(1.25);
  });

  it('resets run-specific values', () => {
    const run = createRunState(config);
    run.score = 999;
    run.eatenCount = 50;
    run.size = 176;
    run.elapsedSeconds = 120;

    expect(resetRunState(config)).toEqual(createRunState(config));
  });

  it('reports deterministic progression stages', () => {
    const thresholds = [36, 48, 72, 96, 120, 176];
    expect(getProgressionStage(36, thresholds)).toBe(1);
    expect(getProgressionStage(72, thresholds)).toBe(3);
    expect(getProgressionStage(175, thresholds)).toBe(5);
    expect(getProgressionStage(176, thresholds)).toBe(6);
  });

  it('formats large and invalid score values safely', () => {
    expect(formatScore(999999)).toBe('999999');
    expect(formatScore(-10)).toBe('0');
    expect(formatScore(Number.NaN)).toBe('0');
  });
});
