import { advanceMusicScheduler, createMusicScheduler } from './musicScore.js';

// The controller owns audio *state* (what is enabled, what is playing, when an
// effect last fired). The backend owns sound *production*. Any backend error
// disables audio instead of propagating, so a missing or blocked audio device
// can never break gameplay.
//
// Backend contract:
//   isAvailable(): boolean
//   currentTime(): number
//   resume(): void            (call from a user gesture)
//   suspend(): void
//   scheduleNote(note, volume): void
//   playEffect(name, volume): void
//   setMusicEnabled(enabled): void
//   silenceMusic(): void      (drop notes already queued)
export function createAudioController(backend, config) {
  const state = {
    available: Boolean(backend) && safeCall(() => backend.isAvailable(), false),
    musicEnabled: true,
    effectsEnabled: true,
    musicPlaying: false,
    suspended: false,
    scheduler: createMusicScheduler(),
    lastEffectTime: new Map(),
  };

  function safeCall(fn, fallback) {
    try {
      return fn();
    } catch (error) {
      if (state) {
        state.available = false;
      }
      return fallback;
    }
  }

  function now() {
    return safeCall(() => backend.currentTime(), 0);
  }

  const controller = {
    state,

    get isAvailable() {
      return state.available;
    },

    resume() {
      if (!state.available) return;
      state.suspended = false;
      safeCall(() => backend.resume());
    },

    suspend() {
      if (!state.available) return;
      state.suspended = true;
      safeCall(() => backend.suspend());
    },

    startMusic() {
      // Idempotent: a second call must never create a second playback.
      if (!state.available || state.musicPlaying) return;
      state.musicPlaying = true;
      state.scheduler = createMusicScheduler();
      if (typeof backend.startMusic === 'function') {
        safeCall(() => backend.startMusic(config.musicVolume));
      }
    },

    stopMusic() {
      if (!state.musicPlaying) return;
      state.musicPlaying = false;
      state.scheduler = createMusicScheduler();
      if (state.available) {
        safeCall(() => backend.silenceMusic());
      }
    },

    // Called every frame. Cheap when nothing needs scheduling.
    update() {
      if (
        !state.available ||
        !state.musicPlaying ||
        !state.musicEnabled ||
        state.suspended
      ) {
        return;
      }
      const notes = advanceMusicScheduler(state.scheduler, now(), config);
      for (const note of notes) {
        if (!state.available) break;
        safeCall(() => backend.scheduleNote(note, config.musicVolume));
      }
    },

    setMusicEnabled(enabled) {
      state.musicEnabled = Boolean(enabled);
      if (state.available) {
        safeCall(() => backend.setMusicEnabled(state.musicEnabled));
      }
      if (!state.musicEnabled) {
        // Drop queued notes and restart the schedule cleanly on re-enable so
        // the loop does not resume with stale timing.
        if (state.available) safeCall(() => backend.silenceMusic());
        state.scheduler = createMusicScheduler();
      }
      return state.musicEnabled;
    },

    setEffectsEnabled(enabled) {
      state.effectsEnabled = Boolean(enabled);
      return state.effectsEnabled;
    },

    toggleMusic() {
      return controller.setMusicEnabled(!state.musicEnabled);
    },

    toggleEffects() {
      return controller.setEffectsEnabled(!state.effectsEnabled);
    },

    // One-key mute: if anything is audible, silence everything; otherwise
    // restore everything.
    toggleMuteAll() {
      const anythingAudible = state.musicEnabled || state.effectsEnabled;
      controller.setMusicEnabled(!anythingAudible);
      controller.setEffectsEnabled(!anythingAudible);
      return !anythingAudible;
    },

    playEffect(name) {
      if (!state.available || !state.effectsEnabled || state.suspended) {
        return false;
      }
      const cooldown = config.effectCooldownSeconds?.[name] ?? 0;
      const time = now();
      const last = state.lastEffectTime.get(name);
      if (last !== undefined && time - last < cooldown) {
        return false;
      }
      state.lastEffectTime.set(name, time);
      safeCall(() => backend.playEffect(name, config.effectsVolume));
      return true;
    },
  };

  return controller;
}
