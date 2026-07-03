/**
 * Notification sounds. Tones are synthesised in the browser (Web Audio) — no
 * audio files to ship. The master on/off switch is a backend preference
 * (`/me/settings.soundEnabled`, fed into `lib/play-sound` by SettingsSync);
 * the per-event tone assignment below is a fixed app default.
 */
export type SoundId = "chime" | "ding" | "pop" | "marimba" | "beep" | "none";

export type SoundEvent = "chatComplete" | "billingSuccess" | "billingError";

export interface SoundSettings {
  enabled: boolean;
  chatComplete: SoundId;
  billingSuccess: SoundId;
  billingError: SoundId;
}

export const DEFAULT_SOUND_SETTINGS: SoundSettings = {
  enabled: true,
  chatComplete: "chime",
  billingSuccess: "marimba",
  billingError: "beep",
};

/** Set (sessionStorage) right before redirecting to checkout; read on return to cue the result. */
export const BILLING_PENDING_KEY = "peoplor:billing-pending";
