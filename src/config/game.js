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
  }),
  fishPopulation: Object.freeze({
    spawnIntervalSeconds: 1.2,
    populationLimit: 24,
  }),
});
