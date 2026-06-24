"use client";

import { useCallback, useSyncExternalStore } from "react";

/**
 * Settings the prototype exposes that the backend doesn't persist yet
 * (notifications, job-search/hiring prefs, privacy, security flags). Stored
 * locally via an external store so reads stay out of render-effects; once the
 * settings API exists (see api-need.md) these move server-side.
 */
export interface LocalSettings {
  enterToSend: boolean;
  notif_messages: boolean;
  notif_status: boolean;
  notif_jobs: boolean;
  notif_email: boolean;
  jobAlertFreq: "instant" | "daily" | "weekly" | "off";
  searchStatus: "active" | "open" | "closed";
  employmentType: "full" | "part" | "shift" | "any";
  hireStatus: "active" | "open" | "paused";
  aiScreen: boolean;
  autoInvite: boolean;
  expectedSalary: string;
  preferredCity: string;
  openRemote: boolean;
  readyRelocate: boolean;
  resumeVisibility: "all" | "applied" | "hidden";
  showOnline: boolean;
  readReceipts: boolean;
  allowCalls: boolean;
  twoStep: boolean;
  bannerDismissed: boolean;
}

const DEFAULTS: LocalSettings = {
  enterToSend: true,
  notif_messages: true,
  notif_status: true,
  notif_jobs: true,
  notif_email: false,
  jobAlertFreq: "daily",
  searchStatus: "active",
  employmentType: "full",
  hireStatus: "active",
  aiScreen: true,
  autoInvite: false,
  expectedSalary: "From 9,500,000 so'm",
  preferredCity: "Tashkent, all areas",
  openRemote: false,
  readyRelocate: true,
  resumeVisibility: "applied",
  showOnline: true,
  readReceipts: true,
  allowCalls: true,
  twoStep: false,
  bannerDismissed: false,
};

const KEY = "peoplor_settings_v1";
const EVENT = "peoplor:settings-change";

let cachedRaw: string | null = null;
let cachedValue: LocalSettings = DEFAULTS;

function subscribe(onChange: () => void): () => void {
  window.addEventListener("storage", onChange);
  window.addEventListener(EVENT, onChange);
  return () => {
    window.removeEventListener("storage", onChange);
    window.removeEventListener(EVENT, onChange);
  };
}

function getSnapshot(): LocalSettings {
  const raw = window.localStorage.getItem(KEY);
  if (raw === cachedRaw) return cachedValue;
  cachedRaw = raw;
  if (!raw) {
    cachedValue = DEFAULTS;
    return cachedValue;
  }
  try {
    cachedValue = { ...DEFAULTS, ...(JSON.parse(raw) as Partial<LocalSettings>) };
  } catch {
    cachedValue = DEFAULTS;
  }
  return cachedValue;
}

function getServerSnapshot(): LocalSettings {
  return DEFAULTS;
}

/** The locally-persisted settings + a partial updater. */
export function useLocalSettings() {
  const settings = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const update = useCallback((patch: Partial<LocalSettings>) => {
    const next = { ...getSnapshot(), ...patch };
    try {
      window.localStorage.setItem(KEY, JSON.stringify(next));
    } catch {
      // Storage disabled — nothing else to do.
    }
    window.dispatchEvent(new Event(EVENT));
  }, []);

  return { settings, update };
}
