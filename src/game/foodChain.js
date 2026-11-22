export function createRunState(config) {
  return {
    size: config.initialSize,
    eatenCount: 0,
    score: 0,
    status: 'playing',
  };
}

// The gameplay size is the entity diameter. Collision is a circle with the
// configured fraction of that diameter as its radius.
export function getCollisionRadius(entity, radiusScale = 0.5) {
  return entity.size * radiusScale;
}

export function circlesOverlap(first, second, radiusScale = 0.5) {
  const dx = first.x - second.x;
  const dy = first.y - second.y;
  const distance = Math.hypot(dx, dy);
  return (
    distance <=
    getCollisionRadius(first, radiusScale) +
      getCollisionRadius(second, radiusScale)
  );
}

export function resolveFishCollisions(player, runState, fish, config) {
  if (runState.status !== 'playing') {
    return runState;
  }

  const playerEntity = {
    x: player.x,
    y: player.y,
    size: runState.size,
  };
  const collisions = fish
    .filter((prey) => {
      const preyEntity = {
        x: prey.x,
        y: prey.y,
        size: prey.size,
      };
      return circlesOverlap(
        playerEntity,
        preyEntity,
        config.collisionRadiusScale,
      );
    })
    .sort((first, second) => first.size - second.size || first.id - second.id);

  if (collisions.some((prey) => prey.size >= runState.size)) {
    runState.status = 'dead';
    return runState;
  }

  if (collisions.length === 0) {
    return runState;
  }

  const consumedIds = new Set();
  for (const prey of collisions) {
    if (prey.size >= runState.size || consumedIds.has(prey.id)) {
      continue;
    }
    consumedIds.add(prey.id);
    runState.size += config.growthPerMeal;
    runState.eatenCount += 1;
    runState.score += config.scorePerFish;
  }

  for (let index = fish.length - 1; index >= 0; index -= 1) {
    if (consumedIds.has(fish[index].id)) {
      fish.splice(index, 1);
    }
  }

  return runState;
}
