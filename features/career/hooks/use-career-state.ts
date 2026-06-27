"use client";

import { useCallback, useSyncExternalStore } from "react";

import type { CountryId, StepId } from "@/features/career/data/career.fixtures";

/**
 * Client-side persistence for the Career / Global hiring screens.
 *
 * The prototype keeps the "Open to international work" toggle, the selected
 * country/market and the roadmap step completion in `localStorage`. None of this
 * is backed by an API yet (see `docs/api/career-and-global-hiring.md` — these map
 * to a worker migration-preferences endpoint and an employer global-hiring
 * setting). Read via `useSyncExternalStore` so it's React-Compiler-safe and SSR
 * stable; the seam swaps to TanStack Query + a mutation when the backend lands.
 */

/* ---------------- worker: career state ---------------- */
export interface CareerState {
  intl: boolean;
  country: CountryId;
  done: Partial<Record<StepId, boolean>>;
}
const CAREER_KEY = "peoplor_career_v1";
const CAREER_EVENT = "peoplor:career";
const CAREER_DEFAULTS: CareerState = { intl: true, country: "UK", done: {} };

let careerRaw: string | null = null;
let careerCache: CareerState = CAREER_DEFAULTS;

function readCareer(): CareerState {
  if (typeof window === "undefined") return CAREER_DEFAULTS;
  const raw = window.localStorage.getItem(CAREER_KEY);
  if (raw === careerRaw) return careerCache;
  careerRaw = raw;
  if (!raw) return (careerCache = CAREER_DEFAULTS);
  try {
    const parsed = JSON.parse(raw) as Partial<CareerState>;
    careerCache = {
      intl: typeof parsed.intl === "boolean" ? parsed.intl : CAREER_DEFAULTS.intl,
      country: parsed.country ?? CAREER_DEFAULTS.country,
      done: parsed.done ?? {},
    };
  } catch {
    careerCache = CAREER_DEFAULTS;
  }
  return careerCache;
}

/* ---------------- employer: global hiring state ---------------- */
export interface GlobalHiringState {
  intl: boolean;
  market: CountryId;
}
const GH_KEY = "peoplor_globalhire_v1";
const GH_EVENT = "peoplor:globalhire";
const GH_DEFAULTS: GlobalHiringState = { intl: true, market: "UK" };

let ghRaw: string | null = null;
let ghCache: GlobalHiringState = GH_DEFAULTS;

function readGh(): GlobalHiringState {
  if (typeof window === "undefined") return GH_DEFAULTS;
  const raw = window.localStorage.getItem(GH_KEY);
  if (raw === ghRaw) return ghCache;
  ghRaw = raw;
  if (!raw) return (ghCache = GH_DEFAULTS);
  try {
    const parsed = JSON.parse(raw) as Partial<GlobalHiringState>;
    ghCache = {
      intl: typeof parsed.intl === "boolean" ? parsed.intl : GH_DEFAULTS.intl,
      market: parsed.market ?? GH_DEFAULTS.market,
    };
  } catch {
    ghCache = GH_DEFAULTS;
  }
  return ghCache;
}

function makeSubscribe(event: string) {
  return (onChange: () => void) => {
    if (typeof window === "undefined") return () => {};
    window.addEventListener("storage", onChange);
    window.addEventListener(event, onChange);
    return () => {
      window.removeEventListener("storage", onChange);
      window.removeEventListener(event, onChange);
    };
  };
}
const subscribeCareer = makeSubscribe(CAREER_EVENT);
const subscribeGh = makeSubscribe(GH_EVENT);

export function useCareerState() {
  const state = useSyncExternalStore(subscribeCareer, readCareer, () => CAREER_DEFAULTS);
  const update = useCallback((patch: Partial<CareerState>) => {
    const next = { ...readCareer(), ...patch };
    window.localStorage.setItem(CAREER_KEY, JSON.stringify(next));
    window.dispatchEvent(new Event(CAREER_EVENT));
  }, []);
  const toggleStep = useCallback((id: StepId) => {
    const cur = readCareer();
    const done = { ...cur.done, [id]: !cur.done[id] };
    window.localStorage.setItem(CAREER_KEY, JSON.stringify({ ...cur, done }));
    window.dispatchEvent(new Event(CAREER_EVENT));
    return !cur.done[id];
  }, []);
  return { state, update, toggleStep };
}

export function useGlobalHiringState() {
  const state = useSyncExternalStore(subscribeGh, readGh, () => GH_DEFAULTS);
  const update = useCallback((patch: Partial<GlobalHiringState>) => {
    const next = { ...readGh(), ...patch };
    window.localStorage.setItem(GH_KEY, JSON.stringify(next));
    window.dispatchEvent(new Event(GH_EVENT));
  }, []);
  return { state, update };
}
