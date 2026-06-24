"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  useSyncExternalStore,
} from "react";

import { ACCOUNT_TYPE } from "@/interfaces/enums";
import type { RegistrationAccountType } from "@/features/auth/services/auth.service";
import {
  LANDING_COPY,
  LANG_STORAGE_KEY,
  SEED_STORAGE_KEY,
  type Lang,
  type LandingCopy,
  type Side,
} from "@/features/marketing/i18n/landing-copy";

interface LandingContextValue {
  side: Side;
  setSide: (side: Side) => void;
  lang: Lang;
  setLang: (lang: Lang) => void;
  /** Localised copy for the active language. */
  copy: LandingCopy;
  /** Account type the chosen side maps to (find → WORKER, hire → EMPLOYER). */
  accountType: RegistrationAccountType;
  /** Whether the auth modal is open. */
  authOpen: boolean;
  /** The hero query echoed in the auth modal (empty when opened from a button). */
  authPrompt: string;
  openAuth: (prompt?: string) => void;
  closeAuth: () => void;
}

const LandingContext = createContext<LandingContextValue | null>(null);
const LANG_EVENT = "peoplor:lang";

function isLang(value: string | null): value is Lang {
  return value === "en" || value === "ru" || value === "uz";
}

/** The language preference is read through an external store so the read stays
 * out of a render-effect and SSR/CSR snapshots reconcile cleanly. */
function subscribeLang(onChange: () => void): () => void {
  window.addEventListener("storage", onChange);
  window.addEventListener(LANG_EVENT, onChange);
  return () => {
    window.removeEventListener("storage", onChange);
    window.removeEventListener(LANG_EVENT, onChange);
  };
}
function readStoredLang(): Lang {
  try {
    const saved = localStorage.getItem(LANG_STORAGE_KEY);
    if (isLang(saved)) return saved;
  } catch {
    // Ignore storage failures (private mode etc.).
  }
  return "en";
}
function serverLang(): Lang {
  return "en";
}

export function LandingProvider({ children }: { children: React.ReactNode }) {
  const [side, setSide] = useState<Side>("find");
  const [authOpen, setAuthOpen] = useState(false);
  const [authPrompt, setAuthPrompt] = useState("");

  const lang = useSyncExternalStore(subscribeLang, readStoredLang, serverLang);

  const setLang = useCallback((next: Lang) => {
    try {
      localStorage.setItem(LANG_STORAGE_KEY, next);
    } catch {
      // Ignore storage failures (private mode etc.).
    }
    window.dispatchEvent(new Event(LANG_EVENT));
    document.documentElement.lang = next;
  }, []);

  const openAuth = useCallback((prompt = "") => {
    setAuthPrompt(prompt);
    if (prompt) {
      try {
        localStorage.setItem(SEED_STORAGE_KEY, prompt);
      } catch {
        // Ignore storage failures.
      }
    }
    setAuthOpen(true);
  }, []);

  const closeAuth = useCallback(() => setAuthOpen(false), []);

  // Lock body scroll while the auth modal is open.
  useEffect(() => {
    if (!authOpen) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [authOpen]);

  const value = useMemo<LandingContextValue>(
    () => ({
      side,
      setSide,
      lang,
      setLang,
      copy: LANDING_COPY[lang],
      accountType:
        side === "hire" ? ACCOUNT_TYPE.EMPLOYER : ACCOUNT_TYPE.WORKER,
      authOpen,
      authPrompt,
      openAuth,
      closeAuth,
    }),
    [side, lang, setLang, authOpen, authPrompt, openAuth, closeAuth],
  );

  return (
    <LandingContext.Provider value={value}>{children}</LandingContext.Provider>
  );
}

export function useLanding(): LandingContextValue {
  const ctx = useContext(LandingContext);
  if (!ctx) {
    throw new Error("useLanding must be used within a LandingProvider");
  }
  return ctx;
}
