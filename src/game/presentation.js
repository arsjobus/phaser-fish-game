// Pure presentation helpers. Nothing here reads or writes gameplay state:
// effects are applied to display objects only, so collision values (which use
// `runState.size` and fish `size`) are never altered by animation.

function clamp(value, minimum, maximum) {
  return Math.min(maximum, Math.max(minimum, value));
}

// Small deterministic phase offset so fish do not wiggle in lockstep.
export function phaseForId(id) {
  const value = Math.sin((Number(id) || 0) * 12.9898) * 43758.5453;
  return (value - Math.floor(value)) * Math.PI * 2;
}

// Tail-wag approximation: the body compresses/stretches slightly and rocks a
// few degrees. Amplitude is reduced for the smallest fish so they stay
// readable.
export function swimWiggle(timeSeconds, id, size, config) {
  const sizeFactor = clamp(
    size / config.fullAmplitudeSize,
    config.smallestFishScale,
    1,
  );
  const phase = timeSeconds * config.frequencyHz * Math.PI * 2 + phaseForId(id);
  const wave = Math.sin(phase);
  const amplitude = config.amplitude * sizeFactor;
  return {
    scaleX: 1 + wave * amplitude,
    scaleY: 1 - wave * amplitude * 0.6,
    angleDegrees: Math.cos(phase) * config.angleDegrees * sizeFactor,
  };
}

// Display-scale multiplier for the brief growth response after a meal. Eases
// out and back to exactly 1 once the pulse is over.
export function growthPulseScale(elapsedMs, config) {
  if (
    !Number.isFinite(elapsedMs) ||
    elapsedMs < 0 ||
    elapsedMs >= config.durationMs
  ) {
    return 1;
  }
  const progress = elapsedMs / config.durationMs;
  return 1 + (config.scale - 1) * Math.sin(progress * Math.PI);
}

export function clampFrameSeconds(deltaMilliseconds, maximumSeconds) {
  if (!Number.isFinite(deltaMilliseconds) || deltaMilliseconds <= 0) {
    return 0;
  }
  return Math.min(deltaMilliseconds / 1000, maximumSeconds);
}

// Which required texture keys failed to load (or were never provided).
export function findMissingTextureKeys(requiredKeys, exists) {
  return requiredKeys.filter((key) => {
    try {
      return !exists(key);
    } catch (error) {
      return true;
    }
  });
}

// Keyboard focus handling. Losing window focus pauses a live run and drops
// held keys; the run only resumes after the player deliberately presses a key
// or clicks, so returning to the window never drops them into a fish.
export function createFocusPause() {
  return { paused: false, focusReturned: false };
}

export function focusLost(pause, isPlaying) {
  if (isPlaying) {
    pause.paused = true;
  }
  pause.focusReturned = false;
  return pause;
}

export function focusGained(pause) {
  if (pause.paused) {
    pause.focusReturned = true;
  }
  return pause;
}

export function inputReceived(pause) {
  if (pause.paused && pause.focusReturned) {
    pause.paused = false;
    pause.focusReturned = false;
    return true;
  }
  return false;
}

export function resetFocusPause(pause) {
  pause.paused = false;
  pause.focusReturned = false;
  return pause;
}
