export function createPlayerMovement(position = { x: 480, y: 270 }) {
  return {
    x: position.x,
    y: position.y,
    velocityX: 0,
    velocityY: 0,
  };
}

export function updatePlayerMovement(state, input, elapsedSeconds, config, bounds) {
  if (!Number.isFinite(elapsedSeconds) || elapsedSeconds <= 0) {
    return state;
  }

  const dt = elapsedSeconds;
  let inputX = Number(input?.left ? 1 : 0) * -1 + Number(input?.right ? 1 : 0);
  let inputY = Number(input?.up ? 1 : 0) * -1 + Number(input?.down ? 1 : 0);
  const inputLength = Math.hypot(inputX, inputY);

  if (inputLength > 0) {
    inputX /= inputLength;
    inputY /= inputLength;
  }

  const decay = config.drag === 0 ? 1 : Math.exp(-config.drag * dt);
  const velocityIntegral =
    config.drag === 0
      ? dt
      : (1 - decay) / config.drag;
  const displacementIntegral =
    config.drag === 0
      ? dt * dt / 2
      : (dt - velocityIntegral) / config.drag;
  let velocityX =
    state.velocityX * decay + inputX * config.acceleration * velocityIntegral;
  let velocityY =
    state.velocityY * decay + inputY * config.acceleration * velocityIntegral;
  let x =
    state.x +
    state.velocityX * velocityIntegral +
    inputX * config.acceleration * displacementIntegral;
  let y =
    state.y +
    state.velocityY * velocityIntegral +
    inputY * config.acceleration * displacementIntegral;

  const speed = Math.hypot(velocityX, velocityY);
  if (speed > config.maximumSpeed) {
    const speedScale = config.maximumSpeed / speed;
    velocityX *= speedScale;
    velocityY *= speedScale;
  }


  if (x > bounds.right + bounds.radius) {
    x = bounds.left - bounds.radius;
  } else if (x < bounds.left - bounds.radius) {
    x = bounds.right + bounds.radius;
  }

  y = Math.max(bounds.top + bounds.radius, Math.min(bounds.bottom - bounds.radius, y));

  return { x, y, velocityX, velocityY };
}
