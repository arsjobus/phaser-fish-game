export function createRunState(config) {
  return {
    size: config.initialSize,
    eatenCount: 0,
    score: config.startingScore ?? 0,
    elapsedSeconds: 0,
    status: 'playing',
  };
}

export function resetRunState(config) {
  return createRunState(config);
}

export function updateRunProgress(runState, elapsedSeconds) {
  if (
    runState.status !== 'playing' ||
    !Number.isFinite(elapsedSeconds) ||
    elapsedSeconds <= 0
  ) {
    return runState;
  }

  runState.elapsedSeconds += elapsedSeconds;
  return runState;
}

export function calculateMealScore(_prey, config) {
  return config.scorePerFish;
}

export function getProgressionStage(size, progressionThresholds) {
  let stage = 0;
  for (let index = 0; index < progressionThresholds.length; index += 1) {
    if (size >= progressionThresholds[index]) {
      stage = index + 1;
    }
  }
  return stage;
}

export function formatScore(score) {
  if (!Number.isFinite(score) || score < 0) {
    return '0';
  }
  return String(Math.floor(score));
}
