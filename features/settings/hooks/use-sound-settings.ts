"use client";

import { useCallback, useSyncExternalStore } from "react";

import {
  DEFAULT_SOUND_SETTINGS,
  parseSoundSettings,
  SOUNDS_STORAGE_KEY,
  type SoundSettings,
} from "@/features/settings/constants/sounds";

const SOUNDS_EVENT = "peoplor:sounds-change";

// Cache the parsed object so getSnapshot returns a stable reference until the
// stored string actually changes (required by useSyncExternalStore).
let cachedRaw: string | null = null;
let cachedValue: SoundSettings = DEFAULT_SOUND_SETTINGS;

function subscribe(onChange: () => void): () => void {
  window.addEventListener("storage", onChange);
  window.addEventListener(SOUNDS_EVENT, onChange);
  return () => {
    window.removeEventListener("storage", onChange);
    window.removeEventListener(SOUNDS_EVENT, onChange);
  };
}

function getSnapshot(): SoundSettings {
  const raw = window.localStorage.getItem(SOUNDS_STORAGE_KEY);
  if (raw === cachedRaw) return cachedValue;
  cachedRaw = raw;
  cachedValue = parseSoundSettings(raw);
  return cachedValue;
}

function getServerSnapshot(): SoundSettings {
  return DEFAULT_SOUND_SETTINGS;
}

/** The user's sound settings + a partial updater. */
export function useSoundSettings() {
  const settings = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot,
  );

  const update = useCallback((patch: Partial<SoundSettings>) => {
    const next = { ...getSnapshot(), ...patch };
    try {
      window.localStorage.setItem(SOUNDS_STORAGE_KEY, JSON.stringify(next));
    } catch {
      // Storage disabled — nothing else to do.
    }
    window.dispatchEvent(new Event(SOUNDS_EVENT));
  }, []);

  return { settings, update };
}
