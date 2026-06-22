"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
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

function isLang(value: string | null): value is Lang {
  return value === "en" || value === "ru" || value === "uz";
}

export function LandingProvider({ children }: { children: React.ReactNode }) {
  const [side, setSide] = useState<Side>("find");
  const [lang, setLangState] = useState<Lang>("en");
  const [authOpen, setAuthOpen] = useState(false);
  const [authPrompt, setAuthPrompt] = useState("");

  // Hydrate the saved language after mount (avoids SSR/client mismatch).
  useEffect(() => {
    const saved = localStorage.getItem(LANG_STORAGE_KEY);
    if (isLang(saved)) setLangState(saved);
  }, []);

  const setLang = useCallback((next: Lang) => {
    setLangState(next);
    try {
      localStorage.setItem(LANG_STORAGE_KEY, next);
    } catch {
      // Ignore storage failures (private mode etc.).
    }
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
