// A short, original, looping arcade tune. Written as data so the loop can be
// scheduled and tested without any audio hardware.
//
// Each step is one eighth note. `lead` and `bass` are MIDI note numbers or
// null for a rest. The loop is 32 steps (two bars of 4/4 at eighth-note
// resolution is 16; this is a four-bar phrase).
export const MUSIC_SCORE = Object.freeze({
  lead: Object.freeze([
    72, null, 76, null, 79, 76, 72, null,
    74, null, 77, null, 81, 77, 74, null,
    76, null, 79, null, 83, 79, 76, null,
    74, 76, 77, 79, 77, 76, 74, null,
  ]),
  bass: Object.freeze([
    48, null, 48, null, 55, null, 48, null,
    53, null, 53, null, 60, null, 53, null,
    52, null, 52, null, 59, null, 52, null,
    55, null, 55, null, 50, null, 55, null,
  ]),
});

export function getScoreLength(score = MUSIC_SCORE) {
  return score.lead.length;
}

export function getStepDurationSeconds(tempoBpm) {
  return 60 / tempoBpm / 2;
}

export function createMusicScheduler() {
  return { nextStepIndex: 0, nextStepTime: null };
}

// Returns every note that should be handed to the audio backend so that audio
// is queued up to `currentTime + lookaheadSeconds`. Each global step index is
// emitted exactly once, and step times are contiguous across the loop point,
// so the loop has neither a gap nor a doubled note.
export function advanceMusicScheduler(
  scheduler,
  currentTime,
  { tempoBpm, lookaheadSeconds },
  score = MUSIC_SCORE,
) {
  const notes = [];
  if (!Number.isFinite(currentTime)) {
    return notes;
  }

  const stepSeconds = getStepDurationSeconds(tempoBpm);
  const length = getScoreLength(score);
  const startPadding = 0.05;

  if (scheduler.nextStepTime === null) {
    scheduler.nextStepTime = currentTime + startPadding;
  } else if (scheduler.nextStepTime < currentTime - startPadding) {
    // The clock moved on without us (for example after a long stall). Realign
    // rather than flooding the backend with a backlog of stale notes.
    scheduler.nextStepTime = currentTime + startPadding;
  }

  while (scheduler.nextStepTime < currentTime + lookaheadSeconds) {
    const step = scheduler.nextStepIndex % length;
    const time = scheduler.nextStepTime;
    if (score.lead[step] !== null) {
      notes.push({ voice: 'lead', midi: score.lead[step], time, duration: stepSeconds * 0.9 });
    }
    if (score.bass[step] !== null) {
      notes.push({ voice: 'bass', midi: score.bass[step], time, duration: stepSeconds * 1.8 });
    }
    scheduler.nextStepIndex += 1;
    scheduler.nextStepTime += stepSeconds;
  }

  return notes;
}
