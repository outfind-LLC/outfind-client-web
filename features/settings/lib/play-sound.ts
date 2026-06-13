import {
  DEFAULT_SOUND_SETTINGS,
  parseSoundSettings,
  SOUNDS_STORAGE_KEY,
  type SoundEvent,
  type SoundId,
} from "@/features/settings/constants/sounds";

/**
 * Lightweight notification sounds synthesised with the Web Audio API — no audio
 * assets, works offline, and starts only after a user gesture (browser policy),
 * which is always satisfied by the time we play (sending a message, clicking
 * checkout, or previewing in settings).
 */

let ctx: AudioContext | null = null;

function audio(): AudioContext | null {
  if (typeof window === "undefined") return null;
  const Ctor =
    window.AudioContext ??
    (window as unknown as { webkitAudioContext?: typeof AudioContext })
      .webkitAudioContext;
  if (!Ctor) return null;
  ctx ??= new Ctor();
  if (ctx.state === "suspended") void ctx.resume();
  return ctx;
}

interface Note {
  freq: number;
  /** Start offset (s) from now. */
  at: number;
  dur: number;
  type?: OscillatorType;
  gain?: number;
}

const RECIPES: Record<Exclude<SoundId, "none">, Note[]> = {
  // Bright two-note rise — friendly "done".
  chime: [
    { freq: 880, at: 0, dur: 0.18 },
    { freq: 1318.51, at: 0.08, dur: 0.24 },
  ],
  // Single clean bell.
  ding: [{ freq: 1046.5, at: 0, dur: 0.3 }],
  // Short soft blip.
  pop: [{ freq: 440, at: 0, dur: 0.09, type: "triangle" }],
  // Warm ascending triad — celebratory (good for success).
  marimba: [
    { freq: 523.25, at: 0, dur: 0.16, type: "triangle" },
    { freq: 659.25, at: 0.1, dur: 0.16, type: "triangle" },
    { freq: 783.99, at: 0.2, dur: 0.24, type: "triangle" },
  ],
  // Low descending two-tone — signals an error.
  beep: [
    { freq: 330, at: 0, dur: 0.15, type: "square", gain: 0.05 },
    { freq: 220, at: 0.17, dur: 0.22, type: "square", gain: 0.05 },
  ],
};

/** Play a named sound once. No-op for `none` or where Web Audio is unavailable. */
export function playSoundId(id: SoundId): void {
  if (id === "none") return;
  const c = audio();
  if (!c) return;
  const recipe = RECIPES[id];
  const now = c.currentTime;

  for (const note of recipe) {
    const osc = c.createOscillator();
    const gain = c.createGain();
    osc.type = note.type ?? "sine";
    osc.frequency.value = note.freq;

    const peak = note.gain ?? 0.12;
    const start = now + note.at;
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(peak, start + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + note.dur);

    osc.connect(gain).connect(c.destination);
    osc.start(start);
    osc.stop(start + note.dur + 0.03);
  }
}

function currentSettings() {
  if (typeof window === "undefined") return DEFAULT_SOUND_SETTINGS;
  try {
    return parseSoundSettings(window.localStorage.getItem(SOUNDS_STORAGE_KEY));
  } catch {
    return DEFAULT_SOUND_SETTINGS;
  }
}

/** Play the user's chosen sound for an event, respecting the master toggle. */
export function playEventSound(event: SoundEvent): void {
  const settings = currentSettings();
  if (!settings.enabled) return;
  playSoundId(settings[event]);
}
