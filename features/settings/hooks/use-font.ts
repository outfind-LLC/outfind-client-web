"use client";

import { useCallback, useSyncExternalStore } from "react";

import {
  applyFontValue,
  DEFAULT_FONT_ID,
  FONT_STORAGE_KEY,
  isFontId,
  type FontId,
} from "@/features/settings/constants/fonts";

const FONT_EVENT = "peoplor:font-change";

function subscribe(onChange: () => void): () => void {
  window.addEventListener("storage", onChange);
  window.addEventListener(FONT_EVENT, onChange);
  return () => {
    window.removeEventListener("storage", onChange);
    window.removeEventListener(FONT_EVENT, onChange);
  };
}

function getSnapshot(): FontId {
  const stored = window.localStorage.getItem(FONT_STORAGE_KEY);
  return isFontId(stored) ? stored : DEFAULT_FONT_ID;
}

function getServerSnapshot(): FontId {
  return DEFAULT_FONT_ID;
}

/** The active font + a setter, applied the same way the boot script does. */
export function useFont() {
  const font = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const setFont = useCallback((id: FontId) => {
    applyFontValue(id);
    try {
      window.localStorage.setItem(FONT_STORAGE_KEY, id);
    } catch {
      // Storage disabled — the DOM update still applies.
    }
    window.dispatchEvent(new Event(FONT_EVENT));
  }, []);

  return { font, setFont };
}
