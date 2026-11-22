import { describe, expect, it } from 'vitest';
import { gameConfig } from './game.js';
import { validateGameConfig } from './validateConfig.js';

describe('game configuration', () => {
  it('accepts the central defaults', () => {
    expect(validateGameConfig(gameConfig)).toEqual({ valid: true, error: null });
  });

  it('rejects an invalid display width', () => {
    const invalid = {
      ...gameConfig,
      display: { ...gameConfig.display, width: 0 },
    };

    expect(validateGameConfig(invalid)).toEqual({
      valid: false,
      error: 'Invalid game configuration',
    });
  });

  it('rejects an invalid population limit', () => {
    const invalid = {
      ...gameConfig,
      fishPopulation: { ...gameConfig.fishPopulation, populationLimit: 0 },
    };

    expect(validateGameConfig(invalid).valid).toBe(false);
  });

  it('rejects invalid fish distributions and visual variants', () => {
    const invalidSizeRange = {
      ...gameConfig,
      fishPopulation: {
        ...gameConfig.fishPopulation,
        minimumSize: 80,
        maximumSize: 20,
      },
    };
    const invalidVariants = {
      ...gameConfig,
      fishPopulation: { ...gameConfig.fishPopulation, visualVariants: [] },
    };

    expect(validateGameConfig(invalidSizeRange).valid).toBe(false);
    expect(validateGameConfig(invalidVariants).valid).toBe(false);
  });

  it('rejects missing configuration safely', () => {
    expect(validateGameConfig(undefined).valid).toBe(false);
  });

  it('rejects invalid progression configuration', () => {
    const invalid = {
      ...gameConfig,
      player: {
        ...gameConfig.player,
        maximumSize: 20,
        progressionThresholds: [72, 48],
      },
    };

    expect(validateGameConfig(invalid).valid).toBe(false);
  });
});
