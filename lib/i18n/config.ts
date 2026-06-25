/**
 * App-wide locale configuration. The single source of truth for which languages
 * the app supports and how the preference is stored — shared by the marketing
 * surface and the authenticated app so switching language anywhere stays in sync.
 *
 * The preference lives in `localStorage` under `peoplor_lang` and changes are
 * broadcast on the `peoplor:lang` window event (so every `useSyncExternalStore`
 * reader updates without prop-drilling). No locale segment in the URL — switching
 * is purely client-side, matching the prototype's `window.I18N` behaviour.
 */

export const LOCALES = ["en", "ru", "uz"] as const;
export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = "en";

/** localStorage key + window event — shared with the marketing language picker. */
export const LANG_STORAGE_KEY = "peoplor_lang";
export const LANG_EVENT = "peoplor:lang";

/** Endonym shown in the language picker (each language in its own script). */
export const LOCALE_LABELS: Record<Locale, string> = {
  en: "English",
  ru: "Русский",
  uz: "Oʻzbekcha",
};

/** Two-letter label for compact triggers. */
export const LOCALE_SHORT: Record<Locale, string> = {
  en: "EN",
  ru: "RU",
  uz: "UZ",
};

export function isLocale(value: unknown): value is Locale {
  return (
    typeof value === "string" && (LOCALES as readonly string[]).includes(value)
  );
}
