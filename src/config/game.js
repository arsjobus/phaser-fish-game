export const gameConfig = Object.freeze({
  display: Object.freeze({
    width: 960,
    height: 540,
    backgroundColor: '#087fa8',
  }),
  pond: Object.freeze({
    bottomInset: 56,
  }),
  player: Object.freeze({
    acceleration: 900,
    maximumSpeed: 220,
    drag: 3.5,
    initialSize: 36,
    growthPerMeal: 2,
    maximumSize: 176,
    startingScore: 0,
    scorePerFish: 10,
    progressionThresholds: Object.freeze([36, 48, 72, 96, 120, 176]),
    collisionRadiusScale: 0.5,
    collisionAspectRatio: 0.6,
  }),
  fishPopulation: Object.freeze({
    spawnIntervalSeconds: 1.2,
    populationLimit: 24,
    minimumSize: 16,
    maximumSize: 176,
    sizeBands: Object.freeze([
      Object.freeze({ minimumSize: 16, maximumSize: 42, weight: 0.55 }),
      Object.freeze({ minimumSize: 42, maximumSize: 88, weight: 0.30 }),
      Object.freeze({ minimumSize: 88, maximumSize: 176, weight: 0.15 }),
    ]),
    minimumSpeed: 52,
    maximumSpeed: 118,
    visualVariants: Object.freeze(['blue', 'purple', 'pink', 'gold']),
  }),
  audio: Object.freeze({
    musicVolume: 0.22,
    effectsVolume: 0.5,
    tempoBpm: 128,
    lookaheadSeconds: 0.35,
    // Minimum gap between repeats of the same effect so rapid meals do not
    // stack into a buzz. Death and victory are never suppressed.
    effectCooldownSeconds: Object.freeze({
      eat: 0.07,
      death: 0,
      victory: 0,
    }),
  }),
  presentation: Object.freeze({
    water: Object.freeze({ top: '#3fc9ea', bottom: '#087fa8' }),
    sand: Object.freeze({ top: '#d9bf82', bottom: '#b6965a' }),
    swimWiggle: Object.freeze({
      frequencyHz: 3.2,
      amplitude: 0.07,
      angleDegrees: 3,
      smallestFishScale: 0.35,
      fullAmplitudeSize: 64,
    }),
    growthPulse: Object.freeze({ scale: 1.14, durationMs: 220 }),
    // Longest simulation step accepted from a single frame. Protects against
    // huge jumps after the tab was hidden or the browser stalled.
    maxFrameSeconds: 0.1,
    fallbackColors: Object.freeze({
      player: 0xff6a1a,
      blue: 0x20b9ed,
      purple: 0x9a5ad6,
      pink: 0xf27ab3,
      gold: 0xf2b52c,
    }),
    scale: Object.freeze({
      minimumWidth: 480,
      minimumHeight: 270,
      maximumWidth: 1920,
      maximumHeight: 1080,
    }),
  }),
});
