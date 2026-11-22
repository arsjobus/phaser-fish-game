import { describe, expect, it } from 'vitest';
import { gameConfig } from '../config/game.js';
import { createAudioController } from './audioController.js';

function createFakeBackend(overrides = {}) {
  const backend = {
    time: 0,
    available: true,
    calls: [],
    notes: [],
    effects: [],
    isAvailable() { return this.available; },
    currentTime() { return this.time; },
    resume() { this.calls.push('resume'); },
    suspend() { this.calls.push('suspend'); },
    scheduleNote(note, volume) { this.notes.push({ note, volume }); },
    playEffect(name, volume) { this.effects.push({ name, volume }); },
    setMusicEnabled(enabled) { this.calls.push(`music:${enabled}`); },
    silenceMusic() { this.calls.push('silence'); },
    ...overrides,
  };
  return backend;
}

const config = gameConfig.audio;

describe('audio controller', () => {
  it('starts with music and effects enabled but not playing', () => {
    const controller = createAudioController(createFakeBackend(), config);

    expect(controller.state.musicEnabled).toBe(true);
    expect(controller.state.effectsEnabled).toBe(true);
    expect(controller.state.musicPlaying).toBe(false);
  });

  it('schedules music only after it is started', () => {
    const backend = createFakeBackend();
    const controller = createAudioController(backend, config);

    controller.update();
    expect(backend.notes).toHaveLength(0);

    controller.startMusic();
    controller.update();
    expect(backend.notes.length).toBeGreaterThan(0);
    expect(backend.notes[0].volume).toBe(config.musicVolume);
  });

  it('does not duplicate playback when started repeatedly', () => {
    const backend = createFakeBackend();
    const controller = createAudioController(backend, config);

    controller.startMusic();
    controller.startMusic();
    controller.update();
    const first = backend.notes.length;
    controller.update();

    // The second update at the same clock time has nothing new to schedule.
    expect(backend.notes.length).toBe(first);
    const times = backend.notes.map(({ note }) => `${note.voice}@${note.time}`);
    expect(new Set(times).size).toBe(times.length);
  });

  it('keeps one continuous schedule as the clock advances', () => {
    const backend = createFakeBackend();
    const controller = createAudioController(backend, config);
    controller.startMusic();

    for (let frame = 0; frame < 600; frame += 1) {
      backend.time = frame / 60;
      controller.update();
    }

    const keys = backend.notes.map(({ note }) => `${note.voice}@${note.time.toFixed(6)}`);
    expect(new Set(keys).size).toBe(keys.length);
    expect(backend.notes.length).toBeGreaterThan(20);
  });

  it('stops scheduling and silences queued notes when music stops', () => {
    const backend = createFakeBackend();
    const controller = createAudioController(backend, config);
    controller.startMusic();
    controller.update();
    controller.stopMusic();
    const count = backend.notes.length;
    backend.time = 5;
    controller.update();

    expect(backend.notes.length).toBe(count);
    expect(backend.calls).toContain('silence');
    expect(controller.state.musicPlaying).toBe(false);
  });

  it('toggling music off stops scheduling and toggling on resumes it', () => {
    const backend = createFakeBackend();
    const controller = createAudioController(backend, config);
    controller.startMusic();

    expect(controller.toggleMusic()).toBe(false);
    backend.time = 2;
    controller.update();
    expect(backend.notes).toHaveLength(0);
    expect(backend.calls).toContain('music:false');

    expect(controller.toggleMusic()).toBe(true);
    controller.update();
    expect(backend.notes.length).toBeGreaterThan(0);
    expect(controller.state.musicPlaying).toBe(true);
  });

  it('toggling effects only affects effects', () => {
    const backend = createFakeBackend();
    const controller = createAudioController(backend, config);
    controller.startMusic();

    controller.toggleEffects();
    expect(controller.playEffect('eat')).toBe(false);
    controller.update();
    expect(backend.effects).toHaveLength(0);
    expect(backend.notes.length).toBeGreaterThan(0);
  });

  it('mutes and restores everything with one command', () => {
    const controller = createAudioController(createFakeBackend(), config);

    expect(controller.toggleMuteAll()).toBe(false);
    expect(controller.state.musicEnabled).toBe(false);
    expect(controller.state.effectsEnabled).toBe(false);

    expect(controller.toggleMuteAll()).toBe(true);
    expect(controller.state.musicEnabled).toBe(true);
    expect(controller.state.effectsEnabled).toBe(true);
  });

  it('mute-all silences when only one channel is still audible', () => {
    const controller = createAudioController(createFakeBackend(), config);
    controller.setMusicEnabled(false);

    expect(controller.toggleMuteAll()).toBe(false);
    expect(controller.state.effectsEnabled).toBe(false);
  });

  it('rate-limits repeated effects so they do not overlap disruptively', () => {
    const backend = createFakeBackend();
    const controller = createAudioController(backend, config);

    expect(controller.playEffect('eat')).toBe(true);
    backend.time = config.effectCooldownSeconds.eat / 2;
    expect(controller.playEffect('eat')).toBe(false);
    backend.time = config.effectCooldownSeconds.eat + 0.001;
    expect(controller.playEffect('eat')).toBe(true);
    expect(backend.effects).toHaveLength(2);
  });

  it('never suppresses death or victory effects', () => {
    const backend = createFakeBackend();
    const controller = createAudioController(backend, config);

    expect(controller.playEffect('death')).toBe(true);
    expect(controller.playEffect('death')).toBe(true);
  });

  it('suspends effects and music scheduling while suspended', () => {
    const backend = createFakeBackend();
    const controller = createAudioController(backend, config);
    controller.startMusic();
    controller.suspend();
    controller.update();

    expect(backend.calls).toContain('suspend');
    expect(backend.notes).toHaveLength(0);
    expect(controller.playEffect('eat')).toBe(false);

    controller.resume();
    controller.update();
    expect(backend.calls).toContain('resume');
    expect(backend.notes.length).toBeGreaterThan(0);
  });

  it('is inert and safe when no backend exists', () => {
    const controller = createAudioController(null, config);

    expect(controller.isAvailable).toBe(false);
    expect(() => {
      controller.resume();
      controller.startMusic();
      controller.update();
      controller.toggleMusic();
      controller.toggleEffects();
      controller.toggleMuteAll();
      controller.stopMusic();
      controller.suspend();
    }).not.toThrow();
    expect(controller.playEffect('eat')).toBe(false);
  });

  it('is inert when the backend reports audio unavailable', () => {
    const backend = createFakeBackend({ available: false });
    const controller = createAudioController(backend, config);
    controller.startMusic();
    controller.update();

    expect(controller.isAvailable).toBe(false);
    expect(backend.notes).toHaveLength(0);
  });

  it('disables audio instead of throwing when the backend fails', () => {
    const backend = createFakeBackend({
      playEffect() { throw new Error('audio device lost'); },
    });
    const controller = createAudioController(backend, config);

    expect(() => controller.playEffect('eat')).not.toThrow();
    expect(controller.isAvailable).toBe(false);
    expect(() => controller.update()).not.toThrow();
  });

  it('survives a backend that throws on every scheduling call', () => {
    const backend = createFakeBackend({
      scheduleNote() { throw new Error('boom'); },
    });
    const controller = createAudioController(backend, config);
    controller.startMusic();

    expect(() => controller.update()).not.toThrow();
    expect(controller.isAvailable).toBe(false);
  });
});
