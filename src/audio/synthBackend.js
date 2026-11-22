// Web Audio backend. All sound is synthesised at runtime, so the game ships
// no audio files and there is nothing to license. Returns null when the
// browser has no Web Audio support; the controller treats that as "audio
// unavailable" and the game continues silently.

function midiToHz(midi) {
  return 440 * 2 ** ((midi - 69) / 12);
}

export function createSynthBackend(windowObject = globalThis.window) {
  const AudioContextClass =
    windowObject?.AudioContext ?? windowObject?.webkitAudioContext;
  if (!AudioContextClass) {
    return null;
  }

  let context = null;
  let master = null;
  let musicBus = null;
  let effectsBus = null;
  let failed = false;
  let musicEnabled = true;
  let queued = new Set();

  function ensureContext() {
    if (context || failed) return context;
    try {
      context = new AudioContextClass();
      master = context.createGain();
      master.gain.value = 1;
      master.connect(context.destination);
      musicBus = context.createGain();
      musicBus.gain.value = musicEnabled ? 1 : 0;
      musicBus.connect(master);
      effectsBus = context.createGain();
      effectsBus.connect(master);
    } catch (error) {
      failed = true;
      context = null;
    }
    return context;
  }

  function envelope(gainNode, start, attack, peak, decayEnd) {
    gainNode.gain.setValueAtTime(0.0001, start);
    gainNode.gain.linearRampToValueAtTime(peak, start + attack);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, decayEnd);
  }

  function tone({ bus, type, startHz, endHz, start, duration, peak, attack = 0.005, filterHz }) {
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    oscillator.type = type;
    oscillator.frequency.setValueAtTime(startHz, start);
    if (endHz && endHz !== startHz) {
      oscillator.frequency.exponentialRampToValueAtTime(endHz, start + duration);
    }
    envelope(gain, start, attack, peak, start + duration);
    let tail = oscillator;
    if (filterHz) {
      const filter = context.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = filterHz;
      oscillator.connect(filter);
      tail = filter;
    }
    tail.connect(gain);
    gain.connect(bus);
    oscillator.start(start);
    oscillator.stop(start + duration + 0.05);
    return oscillator;
  }

  const effects = {
    // Wet, burp-like "blorp": a quick rising bloop that slides down, with a
    // wobbling low layer.
    eat(volume) {
      const start = context.currentTime;
      tone({ bus: effectsBus, type: 'sine', startHz: 170, endHz: 430, start, duration: 0.06, peak: 0.9 * volume });
      tone({ bus: effectsBus, type: 'sine', startHz: 430, endHz: 120, start: start + 0.055, duration: 0.17, peak: 0.8 * volume });
      const wobble = tone({
        bus: effectsBus, type: 'sawtooth', startHz: 95, endHz: 70,
        start: start + 0.05, duration: 0.2, peak: 0.28 * volume, filterHz: 420,
      });
      const lfo = context.createOscillator();
      const lfoGain = context.createGain();
      lfo.frequency.value = 28;
      lfoGain.gain.value = 14;
      lfo.connect(lfoGain);
      lfoGain.connect(wobble.frequency);
      lfo.start(start + 0.05);
      lfo.stop(start + 0.3);
    },
    death(volume) {
      const start = context.currentTime;
      tone({ bus: effectsBus, type: 'sawtooth', startHz: 360, endHz: 60, start, duration: 0.7, peak: 0.55 * volume, filterHz: 900 });
      tone({ bus: effectsBus, type: 'square', startHz: 180, endHz: 45, start: start + 0.05, duration: 0.65, peak: 0.25 * volume, filterHz: 500 });
    },
    victory(volume) {
      const start = context.currentTime;
      [60, 64, 67, 72, 76, 79, 84].forEach((midi, index) => {
        tone({
          bus: effectsBus, type: 'triangle', startHz: midiToHz(midi),
          start: start + index * 0.11, duration: index === 6 ? 0.9 : 0.22, peak: 0.55 * volume,
        });
      });
    },
  };

  return {
    isAvailable() {
      return !failed;
    },

    currentTime() {
      return context ? context.currentTime : 0;
    },

    resume() {
      const ctx = ensureContext();
      if (ctx && ctx.state === 'suspended') {
        ctx.resume().catch(() => {});
      }
    },

    suspend() {
      if (context && context.state === 'running') {
        context.suspend().catch(() => {});
      }
    },

    scheduleNote(note, volume) {
      if (!ensureContext() || !musicEnabled) return;
      const isBass = note.voice === 'bass';
      const oscillator = tone({
        bus: musicBus,
        type: isBass ? 'triangle' : 'square',
        startHz: midiToHz(note.midi),
        start: note.time,
        duration: note.duration,
        peak: (isBass ? 0.9 : 0.35) * volume,
        attack: 0.01,
        filterHz: isBass ? 600 : 2600,
      });
      queued.add(oscillator);
      oscillator.onended = () => queued.delete(oscillator);
    },

    playEffect(name, volume) {
      if (!ensureContext() || !effects[name]) return;
      effects[name](volume);
    },

    setMusicEnabled(enabled) {
      musicEnabled = enabled;
      if (musicBus && context) {
        musicBus.gain.setTargetAtTime(enabled ? 1 : 0, context.currentTime, 0.02);
      }
    },

    silenceMusic() {
      for (const oscillator of queued) {
        try {
          oscillator.stop();
        } catch (error) {
          // Already stopped.
        }
      }
      queued = new Set();
    },
  };
}
