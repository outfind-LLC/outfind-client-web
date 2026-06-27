"use client";

import { useCallback, useSyncExternalStore } from "react";

/**
 * Company fields the prototype shows but the backend `EmployerProfile` doesn't
 * carry yet — **tagline**, **founded**, and a list of **locations**. Persisted in
 * a localStorage seam (same pattern as `use-profile-identity`) so the company
 * detail page is complete and editable today; swaps to real columns + endpoints
 * once they ship (see `docs/api/company.md`). No fabricated values — empty until
 * the employer fills them in.
 */
export interface CompanyLocation {
  city: string;
  address: string;
}
export interface CompanyExtras {
  tagline: string;
  founded: string;
  locations: CompanyLocation[];
}

const KEY = "peoplor_company_extras_v1";
const EVENT = "peoplor:company-extras";
const DEFAULTS: CompanyExtras = { tagline: "", founded: "", locations: [] };

let cachedRaw: string | null = null;
let cached: CompanyExtras = DEFAULTS;

function read(): CompanyExtras {
  if (typeof window === "undefined") return DEFAULTS;
  const raw = window.localStorage.getItem(KEY);
  if (raw === cachedRaw) return cached;
  cachedRaw = raw;
  if (!raw) return (cached = DEFAULTS);
  try {
    const parsed = JSON.parse(raw) as Partial<CompanyExtras>;
    cached = {
      tagline: parsed.tagline ?? "",
      founded: parsed.founded ?? "",
      locations: Array.isArray(parsed.locations) ? parsed.locations : [],
    };
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

export function useCompanyExtras() {
  const extras = useSyncExternalStore(subscribe, read, () => DEFAULTS);
  const update = useCallback((patch: Partial<CompanyExtras>) => {
    const next = { ...read(), ...patch };
    window.localStorage.setItem(KEY, JSON.stringify(next));
    window.dispatchEvent(new Event(EVENT));
  }, []);
  return { extras, update };
}
