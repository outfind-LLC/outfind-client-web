"use client";

import { useCallback, useSyncExternalStore } from "react";

/**
 * Identity fields the prototype's "Details" modal edits (surname / name / gender
 * / date of birth / citizenship / work permit) that the backend `WorkerProfile`
 * does not store yet. Persisted locally via an external store so reads stay out
 * of render-effects; once the profile-identity API ships (see docs/api/profile.md)
 * these move server-side. No values are fabricated — every field starts empty.
 */
export interface ProfileIdentity {
  surname: string;
  firstName: string;
  gender: "male" | "female" | "";
  birthdate: string; // DD.MM.YYYY, as entered
  citizenship: string;
  workPermit: string;
}

const DEFAULTS: ProfileIdentity = {
  surname: "",
  firstName: "",
  gender: "",
  birthdate: "",
  citizenship: "",
  workPermit: "",
};

const KEY = "peoplor_profile_identity_v1";
const EVENT = "peoplor:profile-identity";

let cachedRaw: string | null = null;
let cachedValue: ProfileIdentity = DEFAULTS;

function subscribe(onChange: () => void): () => void {
  window.addEventListener("storage", onChange);
  window.addEventListener(EVENT, onChange);
  return () => {
    window.removeEventListener("storage", onChange);
    window.removeEventListener(EVENT, onChange);
  };
}

function getSnapshot(): ProfileIdentity {
  const raw = window.localStorage.getItem(KEY);
  if (raw === cachedRaw) return cachedValue;
  cachedRaw = raw;
  if (!raw) {
    cachedValue = DEFAULTS;
    return cachedValue;
  }
  try {
    cachedValue = { ...DEFAULTS, ...(JSON.parse(raw) as Partial<ProfileIdentity>) };
  } catch {
    cachedValue = DEFAULTS;
  }
  return cachedValue;
}

function getServerSnapshot(): ProfileIdentity {
  return DEFAULTS;
}

/** The locally-persisted identity fields + a partial updater. */
export function useProfileIdentity() {
  const identity = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const update = useCallback((patch: Partial<ProfileIdentity>) => {
    const next = { ...getSnapshot(), ...patch };
    try {
      window.localStorage.setItem(KEY, JSON.stringify(next));
    } catch {
      // Storage disabled — nothing else to do.
    }
    window.dispatchEvent(new Event(EVENT));
  }, []);

  return { identity, update };
}
