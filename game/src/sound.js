// Tiny WebAudio sounds: a two-note chime for a find, a low thud for a wrong click, a soft blip
// for a hint, and a short arpeggio for a finished scene. Everything is synthesized — no audio
// files, no network. The context is created on the first user gesture, so it never errors before
// anyone has played.
export function createSound() {
  let context = null;

  function ensure() {
    if (!context) {
      try {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        context = new AudioContext();
      } catch {
        context = null;
      }
    }
    if (context && context.state === 'suspended') context.resume().catch(() => {});
    return context;
  }

  function tone(freq, start, dur, type, vol) {
    const ctx = ensure();
    if (!ctx) return;
    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = type || 'sine';
      osc.frequency.value = freq;
      const t0 = ctx.currentTime + start;
      gain.gain.setValueAtTime(0, t0);
      gain.gain.linearRampToValueAtTime(vol || 0.12, t0 + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(t0);
      osc.stop(t0 + dur + 0.05);
    } catch {
      // Sound is decoration: a failure here must never break the game.
    }
  }

  return {
    unlock() {
      ensure();
    },
    find() {
      tone(659, 0, 0.18, 'sine', 0.14);
      tone(880, 0.09, 0.28, 'sine', 0.14);
    },
    wrong() {
      tone(140, 0, 0.16, 'triangle', 0.12);
    },
    hint() {
      tone(520, 0, 0.12, 'sine', 0.08);
    },
    complete() {
      tone(523, 0, 0.14, 'sine', 0.12);
      tone(659, 0.1, 0.14, 'sine', 0.12);
      tone(784, 0.2, 0.22, 'sine', 0.12);
      tone(1047, 0.3, 0.3, 'sine', 0.1);
    },
  };
}
