/**
 * Notification sounds. Tones are synthesised in the browser (Web Audio) — no
 * audio files to ship. The user picks a sound per event and can mute everything.
 */
export type SoundId = "chime" | "ding" | "pop" | "marimba" | "beep" | "none";

export const SOUND_OPTIONS: { id: SoundId; label: string }[] = [
  { id: "chime", label: "Chime" },
  { id: "ding", label: "Ding" },
  { id: "pop", label: "Pop" },
  { id: "marimba", label: "Marimba" },
  { id: "beep", label: "Beep" },
  { id: "none", label: "Off" },
];

export type SoundEvent = "chatComplete" | "billingSuccess" | "billingError";

export const SOUND_EVENTS: {
  id: SoundEvent;
  label: string;
  description: string;
}[] = [
  {
    id: "chatComplete",
    label: "Response ready",
    description: "When the assistant finishes a reply",
  },
  {
    id: "billingSuccess",
    label: "Payment success",
    description: "When a subscription or purchase goes through",
  },
  {
    id: "billingError",
    label: "Payment failed",
    description: "When a payment or checkout fails",
  },
];

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

export const SOUNDS_STORAGE_KEY = "peoplor-sounds";

/** Set right before redirecting to checkout; read on return to cue the result. */
export const BILLING_PENDING_KEY = "peoplor:billing-pending";

export function isSoundId(value: unknown): value is SoundId {
  return SOUND_OPTIONS.some((option) => option.id === value);
}

/** Parse stored settings, falling back field-by-field to the defaults. */
export function parseSoundSettings(raw: string | null): SoundSettings {
  if (!raw) return DEFAULT_SOUND_SETTINGS;
  try {
    const obj = JSON.parse(raw) as Partial<SoundSettings>;
    return {
      enabled:
        typeof obj.enabled === "boolean"
          ? obj.enabled
          : DEFAULT_SOUND_SETTINGS.enabled,
      chatComplete: isSoundId(obj.chatComplete)
        ? obj.chatComplete
        : DEFAULT_SOUND_SETTINGS.chatComplete,
      billingSuccess: isSoundId(obj.billingSuccess)
        ? obj.billingSuccess
        : DEFAULT_SOUND_SETTINGS.billingSuccess,
      billingError: isSoundId(obj.billingError)
        ? obj.billingError
        : DEFAULT_SOUND_SETTINGS.billingError,
    };
  } catch {
    return DEFAULT_SOUND_SETTINGS;
  }
}
