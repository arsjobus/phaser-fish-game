export const HIGH_SCORES_KEY = 'fish-food.high-scores';

function normalizeScores(value) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .filter((score) => Number.isFinite(score) && score >= 0)
    .map((score) => Math.floor(score))
    .sort((first, second) => second - first)
    .slice(0, 5);
}

export function loadHighScores(storage) {
  if (!storage) {
    return [];
  }

  try {
    return normalizeScores(JSON.parse(storage.getItem(HIGH_SCORES_KEY)));
  } catch (_error) {
    return [];
  }
}

export function saveHighScore(storage, score) {
  if (!storage || !Number.isFinite(score) || score < 0) {
    return loadHighScores(storage);
  }

  const scores = normalizeScores([
    ...loadHighScores(storage),
    Math.floor(score),
  ]);

  try {
    storage.setItem(HIGH_SCORES_KEY, JSON.stringify(scores));
  } catch (_error) {
    return loadHighScores(storage);
  }

  return scores;
}
