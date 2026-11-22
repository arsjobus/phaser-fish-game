export function createSeededRandom(seed) {
  let state = Math.trunc(seed) >>> 0;

  return () => {
    state = (state + 0x6d2b79f5) | 0;
    let value = state;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

export function createFishPopulation(random = Math.random) {
  return {
    fish: [],
    spawnTimer: 0,
    nextId: 1,
    random,
  };
}

function spawnFish(population, bounds, config) {
  const direction = population.random() < 0.5 ? 1 : -1;
  const size =
    config.minimumSize +
    population.random() * (config.maximumSize - config.minimumSize);
  const top = size / 2;
  const bottom = bounds.height - bounds.bottomInset - size / 2;
  const y = top + population.random() * Math.max(0, bottom - top);

  population.fish.push({
    id: population.nextId,
    x: direction > 0 ? -size / 2 : bounds.width + size / 2,
    y,
    size,
    direction,
    speed:
      config.minimumSpeed +
      population.random() * (config.maximumSpeed - config.minimumSpeed),
    variant: Math.floor(population.random() * config.visualVariants.length),
  });
  population.nextId += 1;
}

function moveFish(fish, seconds, bounds) {
  for (const entity of fish) {
    entity.x += entity.direction * entity.speed * seconds;
  }

  return fish.filter(
    (entity) =>
      entity.direction > 0
        ? entity.x - entity.size / 2 <= bounds.width
        : entity.x + entity.size / 2 >= 0,
  );
}

export function updateFishPopulation(population, elapsedSeconds, bounds, config) {
  if (!Number.isFinite(elapsedSeconds) || elapsedSeconds <= 0) {
    return population;
  }

  let remaining = elapsedSeconds;
  while (remaining > 0) {
    if (
      population.fish.length < config.populationLimit &&
      population.spawnTimer >= config.spawnIntervalSeconds
    ) {
      population.spawnTimer -= config.spawnIntervalSeconds;
      spawnFish(population, bounds, config);
      continue;
    }

    const canSpawn = population.fish.length < config.populationLimit;
    const untilSpawn = canSpawn
      ? config.spawnIntervalSeconds - population.spawnTimer
      : remaining;
    const step = Math.min(remaining, untilSpawn);
    population.fish = moveFish(population.fish, step, bounds);
    population.spawnTimer += step;
    remaining -= step;

    if (
      population.fish.length < config.populationLimit &&
      population.spawnTimer >= config.spawnIntervalSeconds
    ) {
      population.spawnTimer -= config.spawnIntervalSeconds;
      spawnFish(population, bounds, config);
    }

    if (!canSpawn && population.spawnTimer > config.spawnIntervalSeconds) {
      population.spawnTimer = config.spawnIntervalSeconds;
    }
  }

  return population;
}
