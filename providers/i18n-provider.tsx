"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useSyncExternalStore,
  type ReactNode,
} from "react";

import { type Locale } from "@/lib/i18n/config";
import { MESSAGES } from "@/lib/i18n/messages";
import {
  readStoredLocale,
  serverLocale,
  setStoredLocale,
  subscribeLocale,
} from "@/lib/i18n/store";
import { translate, type MessageKey } from "@/lib/i18n/translate";

export type TranslateFn = (
  key: MessageKey,
  params?: Record<string, string | number>,
) => string;

interface I18nContextValue {
  locale: Locale;
  /** Persist + broadcast a new locale (every reader updates via the store). */
  setLocale: (locale: Locale) => void;
  /** Translate a `"namespace.key"` for the active locale. */
  t: TranslateFn;
}

const I18nContext = createContext<I18nContextValue | null>(null);

/**
 * Provides the active locale + a translate function to the whole tree. The
 * locale is read from the shared external store (localStorage + `peoplor:lang`
 * event) so it stays in sync with the marketing surface and survives reloads.
 * SSR/first paint always render the default locale, then hydrate to the stored
 * one — no mismatch.
 */
export function I18nProvider({ children }: { children: ReactNode }) {
  const locale = useSyncExternalStore(
    subscribeLocale,
    readStoredLocale,
    serverLocale,
  );

  // Keep <html lang> in sync with the active locale (a DOM/external write, so
  // it belongs in an effect — not in render).
  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  const value = useMemo<I18nContextValue>(() => {
    const messages = MESSAGES[locale];
    return {
      locale,
      setLocale: setStoredLocale,
      t: (key, params) => translate(messages, key, params),
    };
  }, [locale]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nContextValue {
  const ctx = useContext(I18nContext);
  if (!ctx) {
    throw new Error("useI18n must be used within an I18nProvider");
  }
  return ctx;
}

/** Convenience hook when a component only needs the translate function. */
export function useT(): TranslateFn {
  return useI18n().t;
}
