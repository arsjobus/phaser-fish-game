import { describe, expect, it } from 'vitest';
import {
  HIGH_SCORES_KEY,
  loadHighScores,
  saveHighScore,
} from './highScores.js';

function createStorage(initialValue) {
  const values = new Map();
  if (initialValue !== undefined) {
    values.set(HIGH_SCORES_KEY, initialValue);
  }
  return {
    getItem(key) {
      return values.has(key) ? values.get(key) : null;
    },
    setItem(key, value) {
      values.set(key, value);
    },
  };
}

describe('high scores', () => {
  it('loads missing and invalid data safely', () => {
    expect(loadHighScores(createStorage())).toEqual([]);
    expect(loadHighScores(createStorage('{broken'))).toEqual([]);
  });

  it('saves, sorts, de-duplicates by value count, and caps scores', () => {
    const storage = createStorage();
    for (const score of [20, 100, 50, 30, 90, 70]) {
      saveHighScore(storage, score);
    }
    expect(loadHighScores(storage)).toEqual([100, 90, 70, 50, 30]);
  });

  it('survives a new storage wrapper', () => {
    const storage = createStorage();
    saveHighScore(storage, 120);
    expect(loadHighScores(createStorage(storage.getItem(HIGH_SCORES_KEY)))).toEqual([
      120,
    ]);
  });
});
