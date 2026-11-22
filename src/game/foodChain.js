import {
  calculateMealScore,
  createRunState,
  resetRunState,
} from './runProgress.js';

export { createRunState, resetRunState };

// Fish are drawn as flattened ellipses, so their collision bounds use the
// same width-to-height ratio rather than a larger circle.
export function getCollisionRadii(entity, radiusScale = 0.5, aspectRatio = 0.6) {
  return {
    x: entity.size * radiusScale,
    y: entity.size * radiusScale * aspectRatio,
  };
}

export function ellipsesOverlap(first, second, radiusScale = 0.5, aspectRatio = 0.6) {
  const dx = first.x - second.x;
  const dy = first.y - second.y;
  const firstRadii = getCollisionRadii(first, radiusScale, aspectRatio);
  const secondRadii = getCollisionRadii(second, radiusScale, aspectRatio);
  const combinedRadiusX = firstRadii.x + secondRadii.x;
  const combinedRadiusY = firstRadii.y + secondRadii.y;
  return (
    (dx * dx) / (combinedRadiusX * combinedRadiusX) +
      (dy * dy) / (combinedRadiusY * combinedRadiusY) <=
    1
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
      return ellipsesOverlap(
        playerEntity,
        preyEntity,
        config.collisionRadiusScale,
        config.collisionAspectRatio,
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
    const maximumSize =
      Number.isFinite(config.maximumSize) ? config.maximumSize : Infinity;
    runState.size = Math.min(
      maximumSize,
      runState.size + config.growthPerMeal,
    );
    runState.eatenCount += 1;
    runState.score += calculateMealScore(prey, config);
  }

  for (let index = fish.length - 1; index >= 0; index -= 1) {
    if (consumedIds.has(fish[index].id)) {
      fish.splice(index, 1);
    }
  }

  return runState;
}
