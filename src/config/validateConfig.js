export function validateGameConfig(config) {
  const display = config?.display;
  const pond = config?.pond;
  const player = config?.player;
  const fishPopulation = config?.fishPopulation;

  const positiveFinite = (value) =>
    typeof value === 'number' && Number.isFinite(value) && value > 0;
  const nonNegativeFinite = (value) =>
    typeof value === 'number' && Number.isFinite(value) && value >= 0;

  const valid =
    positiveFinite(display?.width) &&
    positiveFinite(display?.height) &&
    typeof display?.backgroundColor === 'string' &&
    nonNegativeFinite(pond?.bottomInset) &&
    positiveFinite(player?.acceleration) &&
    positiveFinite(player?.maximumSpeed) &&
    nonNegativeFinite(player?.drag) &&
    positiveFinite(fishPopulation?.spawnIntervalSeconds) &&
    Number.isInteger(fishPopulation?.populationLimit) &&
    fishPopulation.populationLimit > 0;

  return {
    valid,
    error: valid ? null : 'Invalid game configuration',
  };
}
