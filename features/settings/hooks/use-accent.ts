"use client";

import { useCallback, useSyncExternalStore } from "react";

import {
  ACCENT_STORAGE_KEY,
  DEFAULT_ACCENT_ID,
  isAccentId,
  type AccentId,
} from "@/features/settings/constants/accents";

/** Same-tab notification channel (the native `storage` event only fires cross-tab). */
const ACCENT_EVENT = "jobsterr:accent-change";

function subscribe(onChange: () => void): () => void {
  window.addEventListener("storage", onChange);
  window.addEventListener(ACCENT_EVENT, onChange);
  return () => {
    window.removeEventListener("storage", onChange);
    window.removeEventListener(ACCENT_EVENT, onChange);
  };
}

/** Read the live accent from the DOM (set by the boot script) or storage. */
function getSnapshot(): AccentId {
  const fromDom = document.documentElement.dataset.accent;
  if (isAccentId(fromDom)) return fromDom;
  const stored = window.localStorage.getItem(ACCENT_STORAGE_KEY);
  return isAccentId(stored) ? stored : DEFAULT_ACCENT_ID;
}

function getServerSnapshot(): AccentId {
  return DEFAULT_ACCENT_ID;
}

/**
 * The active accent + a setter. Backed by `useSyncExternalStore` so it reads the
 * value the boot script already applied — no `useEffect`, no hydration mismatch,
 * and no flash of the default colour.
 */
export function useAccent() {
  const accent = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot,
  );

  const setAccent = useCallback((id: AccentId) => {
    document.documentElement.dataset.accent = id;
    try {
      window.localStorage.setItem(ACCENT_STORAGE_KEY, id);
    } catch {
      // Private mode / storage disabled — the DOM update still applies.
    }
    window.dispatchEvent(new Event(ACCENT_EVENT));
  }, []);

  return { accent, setAccent };
}
