"use client";

import { useCallback, useSyncExternalStore } from "react";

/**
 * Worker contact details (phone / email / telegram / whatsapp) shown on the
 * profile. Email + Telegram come from the session; phone + WhatsApp aren't on the
 * backend yet, and none are writable from the profile screen. Until an account
 * update endpoint ships (see docs/api/profile.md §5), edits persist in this
 * localStorage seam (same pattern as use-profile-identity). No fabricated values.
 */
export interface ProfileContacts {
  phone: string;
  email: string;
  telegram: string;
  whatsapp: string;
}

const KEY = "peoplor_profile_contacts_v1";
const EVENT = "peoplor:profile-contacts";
const DEFAULTS: ProfileContacts = { phone: "", email: "", telegram: "", whatsapp: "" };

let cachedRaw: string | null = null;
let cached: ProfileContacts = DEFAULTS;

function read(): ProfileContacts {
  if (typeof window === "undefined") return DEFAULTS;
  const raw = window.localStorage.getItem(KEY);
  if (raw === cachedRaw) return cached;
  cachedRaw = raw;
  if (!raw) return (cached = DEFAULTS);
  try {
    cached = { ...DEFAULTS, ...(JSON.parse(raw) as Partial<ProfileContacts>) };
  } catch {
    cached = DEFAULTS;
  }
  return cached;
}

function subscribe(onChange: () => void) {
  if (typeof window === "undefined") return () => {};
  window.addEventListener("storage", onChange);
  window.addEventListener(EVENT, onChange);
  return () => {
    window.removeEventListener("storage", onChange);
    window.removeEventListener(EVENT, onChange);
  };
}

export function useProfileContacts() {
  const contacts = useSyncExternalStore(subscribe, read, () => DEFAULTS);
  const update = useCallback((patch: Partial<ProfileContacts>) => {
    const next = { ...read(), ...patch };
    window.localStorage.setItem(KEY, JSON.stringify(next));
    window.dispatchEvent(new Event(EVENT));
  }, []);
  return { contacts, update };
}
