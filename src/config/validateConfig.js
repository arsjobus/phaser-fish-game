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
    positiveFinite(player?.initialSize) &&
    positiveFinite(player?.growthPerMeal) &&
    nonNegativeFinite(player?.scorePerFish) &&
    positiveFinite(player?.collisionRadiusScale) &&
    positiveFinite(fishPopulation?.spawnIntervalSeconds) &&
    Number.isInteger(fishPopulation?.populationLimit) &&
    fishPopulation.populationLimit > 0 &&
    positiveFinite(fishPopulation?.minimumSize) &&
    positiveFinite(fishPopulation?.maximumSize) &&
    fishPopulation.maximumSize >= fishPopulation.minimumSize &&
    Array.isArray(fishPopulation?.sizeBands) &&
    fishPopulation.sizeBands.length > 0 &&
    fishPopulation.sizeBands.every((band) =>
      positiveFinite(band?.minimumSize) &&
      positiveFinite(band?.maximumSize) &&
      band.maximumSize >= band.minimumSize &&
      positiveFinite(band?.weight),
    ) &&
    Math.abs(
      fishPopulation.sizeBands.reduce((total, band) => total + band.weight, 0) - 1,
    ) < 0.000001 &&
    positiveFinite(fishPopulation?.minimumSpeed) &&
    positiveFinite(fishPopulation?.maximumSpeed) &&
    fishPopulation.maximumSpeed >= fishPopulation.minimumSpeed &&
    Array.isArray(fishPopulation?.visualVariants) &&
    fishPopulation.visualVariants.length > 0 &&
    fishPopulation.visualVariants.every((variant) => typeof variant === 'string') &&
    new Set(fishPopulation.visualVariants).size === fishPopulation.visualVariants.length;

  return {
    valid,
    error: valid ? null : 'Invalid game configuration',
  };
}
