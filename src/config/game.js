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
    scorePerFish: 10,
    collisionRadiusScale: 0.5,
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
});
