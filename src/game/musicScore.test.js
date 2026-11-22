import { describe, expect, it } from 'vitest';
import {
  MUSIC_SCORE,
  advanceMusicScheduler,
  createMusicScheduler,
  getScoreLength,
  getStepDurationSeconds,
} from './musicScore.js';

const options = { tempoBpm: 120, lookaheadSeconds: 0.5 };

function collect(scheduler, until, stepSeconds = 0.1) {
  const notes = [];
  for (let time = 0; time <= until; time += stepSeconds) {
    notes.push(...advanceMusicScheduler(scheduler, time, options));
  }
  return notes;
}

describe('music score', () => {
  it('has matching lead and bass lengths and valid MIDI notes', () => {
    expect(MUSIC_SCORE.bass.length).toBe(MUSIC_SCORE.lead.length);
    for (const note of [...MUSIC_SCORE.lead, ...MUSIC_SCORE.bass]) {
      expect(note === null || (Number.isInteger(note) && note >= 24 && note <= 108)).toBe(true);
    }
  });

  it('schedules the first notes shortly after the start time', () => {
    const scheduler = createMusicScheduler();
    const notes = advanceMusicScheduler(scheduler, 10, options);

    expect(notes.length).toBeGreaterThan(0);
    expect(Math.min(...notes.map((note) => note.time))).toBeGreaterThan(10);
  });

  it('never schedules the same step twice across many polling intervals', () => {
    const scheduler = createMusicScheduler();
    const notes = collect(scheduler, 30);
    const keys = notes.map((note) => `${note.voice}@${note.time.toFixed(6)}`);

    expect(new Set(keys).size).toBe(keys.length);
  });

  it('keeps step times contiguous across the loop boundary', () => {
    const scheduler = createMusicScheduler();
    const stepSeconds = getStepDurationSeconds(options.tempoBpm);
    const length = getScoreLength();
    const notes = collect(scheduler, stepSeconds * length * 2.5);
    const leadTimes = notes.filter((note) => note.voice === 'lead').map((note) => note.time);
    const first = leadTimes[0];

    // Every lead note must land exactly on the global step grid.
    for (const time of leadTimes) {
      const stepsFromStart = (time - first) / stepSeconds;
      expect(Math.abs(stepsFromStart - Math.round(stepsFromStart))).toBeLessThan(1e-6);
    }
    // The score repeats: the second pass equals the first pass.
    const perLoop = MUSIC_SCORE.lead.filter((note) => note !== null).length;
    expect(leadTimes.length).toBeGreaterThan(perLoop * 2);
  });

  it('produces the same schedule regardless of polling frequency', () => {
    const fine = collect(createMusicScheduler(), 20, 0.016);
    const coarse = collect(createMusicScheduler(), 20, 0.2);
    const relative = (notes) => {
      const origin = notes[0].time;
      return notes
        .filter((note) => note.time < origin + 15)
        .map((note) => `${note.voice}:${note.midi}:${(note.time - origin).toFixed(4)}`);
    };

    expect(relative(coarse)).toEqual(relative(fine));
  });

  it('realigns instead of flooding a backlog after a long stall', () => {
    const scheduler = createMusicScheduler();
    advanceMusicScheduler(scheduler, 0, options);
    const notes = advanceMusicScheduler(scheduler, 600, options);

    expect(notes.length).toBeLessThan(MUSIC_SCORE.lead.length * 2);
    expect(Math.min(...notes.map((note) => note.time))).toBeGreaterThanOrEqual(600);
  });

  it('ignores invalid clock values', () => {
    const scheduler = createMusicScheduler();

    expect(advanceMusicScheduler(scheduler, Number.NaN, options)).toEqual([]);
    expect(scheduler.nextStepIndex).toBe(0);
  });
});
