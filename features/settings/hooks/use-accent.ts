"use client";

import { useCallback, useSyncExternalStore } from "react";

import {
  ACCENT_STORAGE_KEY,
  applyAccentValue,
  DEFAULT_ACCENT_ID,
  isAccentValue,
  type AccentValue,
} from "@/features/settings/constants/accents";

/** Same-tab notification channel (the native `storage` event only fires cross-tab). */
const ACCENT_EVENT = "peoplor:accent-change";

function subscribe(onChange: () => void): () => void {
  window.addEventListener("storage", onChange);
  window.addEventListener(ACCENT_EVENT, onChange);
  return () => {
    window.removeEventListener("storage", onChange);
    window.removeEventListener(ACCENT_EVENT, onChange);
  };
}

/** The stored preference is the source of truth (the boot script applies it). */
function getSnapshot(): AccentValue {
  const stored = window.localStorage.getItem(ACCENT_STORAGE_KEY);
  return isAccentValue(stored) ? stored : DEFAULT_ACCENT_ID;
}

function getServerSnapshot(): AccentValue {
  return DEFAULT_ACCENT_ID;
}

/**
 * The active accent (preset id or custom hex) + a setter. Backed by
 * `useSyncExternalStore` so it reflects the value the boot script applied — no
 * `useEffect`, no hydration mismatch, no flash of the default colour.
 */
export function useAccent() {
  const accent = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot,
  );

  const setAccent = useCallback((value: AccentValue) => {
    applyAccentValue(value);
    try {
      window.localStorage.setItem(ACCENT_STORAGE_KEY, value);
    } catch {
      // Private mode / storage disabled — the DOM update still applies.
    }
    window.dispatchEvent(new Event(ACCENT_EVENT));
  }, []);

  return { accent, setAccent };
}
