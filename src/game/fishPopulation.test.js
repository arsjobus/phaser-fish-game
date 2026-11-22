import { describe, expect, it } from 'vitest';
import { gameConfig } from '../config/game.js';
import {
  createFishPopulation,
  createSeededRandom,
  updateFishPopulation,
} from './fishPopulation.js';

const bounds = { width: 960, height: 540, bottomInset: 56 };
const config = gameConfig.fishPopulation;

function advance(seed, seconds, steps) {
  const population = createFishPopulation(createSeededRandom(seed));
  const step = seconds / steps;
  for (let index = 0; index < steps; index += 1) {
    updateFishPopulation(population, step, bounds, config);
  }
  return population;
}

describe('fish population', () => {
  it('spawns fish at either horizontal edge facing inward', () => {
    const population = createFishPopulation(createSeededRandom(17));
    updateFishPopulation(population, config.spawnIntervalSeconds, bounds, config);

    expect(population.fish).toHaveLength(1);
    const fish = population.fish[0];
    if (fish.direction > 0) {
      expect(fish.x).toBeCloseTo(-fish.size / 2);
    } else {
      expect(fish.x).toBeCloseTo(bounds.width + fish.size / 2);
    }
    expect([1, -1]).toContain(fish.direction);
  });

  it('uses both pond edges over a population of fish', () => {
    let draws = 0;
    const random = () => (Math.floor(draws++ / 5) % 2 === 0 ? 0.1 : 0.9);
    const population = createFishPopulation(random);
    updateFishPopulation(population, 4, bounds, config);

    expect(population.fish.some((fish) => fish.direction === 1)).toBe(true);
    expect(population.fish.some((fish) => fish.direction === -1)).toBe(true);
  });

  it('assigns sizes, speeds, and visual variants within configured ranges', () => {
    const population = advance(99, config.spawnIntervalSeconds * 12, 12);

    for (const fish of population.fish) {
      expect(fish.size).toBeGreaterThanOrEqual(config.minimumSize);
      expect(fish.size).toBeLessThanOrEqual(config.maximumSize);
      expect(fish.speed).toBeGreaterThanOrEqual(config.minimumSpeed);
      expect(fish.speed).toBeLessThanOrEqual(config.maximumSpeed);
      expect(fish.variant).toBeGreaterThanOrEqual(0);
      expect(fish.variant).toBeLessThan(config.visualVariants.length);
    }
  });

  it('produces the same spawn sequence for the same seed', () => {
    const first = advance(1234, 8, 8).fish;
    const second = advance(1234, 8, 8).fish;

    expect(first).toEqual(second);
  });

  it('moves in the selected direction and stays consistent across update rates', () => {
    const coarse = advance(321, 6, 6).fish;
    const fine = advance(321, 6, 60).fish;

    expect(fine).toHaveLength(coarse.length);
    for (let index = 0; index < coarse.length; index += 1) {
      expect(fine[index].id).toBe(coarse[index].id);
      expect(fine[index].direction).toBe(coarse[index].direction);
      expect(fine[index].x).toBeCloseTo(coarse[index].x, 6);
      expect(fine[index].y).toBeCloseTo(coarse[index].y, 6);
    }
  });

  it('removes fish only after they have crossed the opposite edge', () => {
    const population = createFishPopulation(createSeededRandom(7));
    updateFishPopulation(population, config.spawnIntervalSeconds, bounds, config);
    const fish = population.fish[0];
    fish.direction = 1;
    fish.speed = 100;
    fish.x = bounds.width - fish.size / 2;

    updateFishPopulation(population, 1, bounds, config);

    expect(population.fish.some((entity) => entity.id === fish.id)).toBe(false);
  });

  it('never exceeds the population limit', () => {
    const limitedConfig = { ...config, populationLimit: 2, spawnIntervalSeconds: 0.1 };
    const population = createFishPopulation(createSeededRandom(42));
    updateFishPopulation(population, 10, bounds, limitedConfig);

    expect(population.fish.length).toBeLessThanOrEqual(2);
  });

  it('cleans up off-screen fish during a long-running simulation', () => {
    const limitedConfig = { ...config, populationLimit: 4, spawnIntervalSeconds: 0.2 };
    const population = createFishPopulation(createSeededRandom(42));
    for (let index = 0; index < 1200; index += 1) {
      updateFishPopulation(population, 0.1, bounds, limitedConfig);
    }

    expect(population.nextId).toBeGreaterThan(limitedConfig.populationLimit);
    expect(population.fish.length).toBeLessThanOrEqual(limitedConfig.populationLimit);
    for (const fish of population.fish) {
      expect(fish.x).toBeGreaterThanOrEqual(-fish.size / 2);
      expect(fish.x).toBeLessThanOrEqual(bounds.width + fish.size / 2);
    }
  });

  it('ignores invalid and non-positive elapsed time', () => {
    const population = createFishPopulation(createSeededRandom(5));

    expect(updateFishPopulation(population, 0, bounds, config).fish).toHaveLength(0);
    expect(updateFishPopulation(population, Number.NaN, bounds, config).fish).toHaveLength(0);
  });
});
