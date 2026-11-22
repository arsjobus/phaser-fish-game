export function validateGameConfig(config) {
  const display = config?.display;
  const pond = config?.pond;
  const player = config?.player;
  const fishPopulation = config?.fishPopulation;
  const audio = config?.audio;
  const presentation = config?.presentation;

  const positiveFinite = (value) =>
    typeof value === 'number' && Number.isFinite(value) && value > 0;
  const nonNegativeFinite = (value) =>
    typeof value === 'number' && Number.isFinite(value) && value >= 0;

  const unitInterval = (value) =>
    typeof value === 'number' && Number.isFinite(value) && value >= 0 && value <= 1;

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
    positiveFinite(player?.maximumSize) &&
    player.maximumSize >= player.initialSize &&
    nonNegativeFinite(player?.startingScore) &&
    nonNegativeFinite(player?.scorePerFish) &&
    Array.isArray(player?.progressionThresholds) &&
    player.progressionThresholds.length > 0 &&
    player.progressionThresholds.every((threshold) => positiveFinite(threshold)) &&
    player.progressionThresholds.every((threshold, index, thresholds) =>
      index === 0 || threshold >= thresholds[index - 1],
    ) &&
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
    new Set(fishPopulation.visualVariants).size === fishPopulation.visualVariants.length &&
    unitInterval(audio?.musicVolume) &&
    unitInterval(audio?.effectsVolume) &&
    positiveFinite(audio?.tempoBpm) &&
    positiveFinite(audio?.lookaheadSeconds) &&
    typeof audio?.effectCooldownSeconds === 'object' &&
    audio.effectCooldownSeconds !== null &&
    Object.values(audio.effectCooldownSeconds).every(nonNegativeFinite) &&
    typeof presentation?.water?.top === 'string' &&
    typeof presentation?.water?.bottom === 'string' &&
    typeof presentation?.sand?.top === 'string' &&
    typeof presentation?.sand?.bottom === 'string' &&
    positiveFinite(presentation?.swimWiggle?.frequencyHz) &&
    nonNegativeFinite(presentation?.swimWiggle?.amplitude) &&
    presentation.swimWiggle.amplitude < 0.5 &&
    nonNegativeFinite(presentation?.swimWiggle?.angleDegrees) &&
    unitInterval(presentation?.swimWiggle?.smallestFishScale) &&
    positiveFinite(presentation?.swimWiggle?.fullAmplitudeSize) &&
    positiveFinite(presentation?.growthPulse?.scale) &&
    presentation.growthPulse.scale >= 1 &&
    positiveFinite(presentation?.growthPulse?.durationMs) &&
    positiveFinite(presentation?.maxFrameSeconds) &&
    typeof presentation?.fallbackColors === 'object' &&
    presentation.fallbackColors !== null &&
    positiveFinite(presentation?.scale?.minimumWidth) &&
    positiveFinite(presentation?.scale?.minimumHeight) &&
    presentation.scale.maximumWidth >= presentation.scale.minimumWidth &&
    presentation.scale.maximumHeight >= presentation.scale.minimumHeight;

  return {
    valid,
    error: valid ? null : 'Invalid game configuration',
  };
}
