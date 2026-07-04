/**
 * The locale preference as an external store, so reads stay out of render
 * effects and SSR/CSR snapshots reconcile cleanly (no hydration mismatch).
 * Consumed via `useSyncExternalStore` in the i18n provider. Writes broadcast on
 * the shared `peoplor:lang` event so the marketing surface and the app agree.
 */
import {
  DEFAULT_LOCALE,
  detectBrowserLocale,
  isLocale,
  LANG_EVENT,
  LANG_STORAGE_KEY,
  type Locale,
} from "./config";

export function subscribeLocale(onStoreChange: () => void): () => void {
  window.addEventListener("storage", onStoreChange);
  window.addEventListener(LANG_EVENT, onStoreChange);
  return () => {
    window.removeEventListener("storage", onStoreChange);
    window.removeEventListener(LANG_EVENT, onStoreChange);
  };
}

/**
 * The active locale on this device: an explicit saved preference if present,
 * otherwise the browser's language (English when it isn't uz/ru/en). Used both
 * by the i18n provider (getSnapshot) and by non-React callers that need the
 * current language for the `X-App-Language` request header.
 */
export function readStoredLocale(): Locale {
  try {
    const saved = localStorage.getItem(LANG_STORAGE_KEY);
    if (isLocale(saved)) return saved;
  } catch {
    // Ignore storage failures (private mode, disabled storage, etc.).
  }
  return detectBrowserLocale();
}

/** Server (and first-paint) snapshot — always the default to match SSR output. */
export function serverLocale(): Locale {
  return DEFAULT_LOCALE;
}

export function setStoredLocale(locale: Locale): void {
  try {
    localStorage.setItem(LANG_STORAGE_KEY, locale);
  } catch {
    // Ignore storage failures; the in-memory event still updates this tab.
  }
  window.dispatchEvent(new Event(LANG_EVENT));
}
