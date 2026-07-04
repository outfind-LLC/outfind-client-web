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

/**
 * Best-effort language from the browser (`navigator.languages`), mapped to a
 * supported locale by primary subtag ("ru-RU" → "ru"). Falls back to the default
 * (English) when the browser language isn't Uzbek, Russian or English — or when
 * `navigator` is unavailable (SSR).
 */
export function detectBrowserLocale(): Locale {
  if (typeof navigator === "undefined") return DEFAULT_LOCALE;
  const candidates =
    navigator.languages && navigator.languages.length > 0
      ? navigator.languages
      : [navigator.language];
  for (const tag of candidates) {
    const primary = tag?.toLowerCase().split(/[-_]/)[0];
    if (isLocale(primary)) return primary;
  }
  return DEFAULT_LOCALE;
}
