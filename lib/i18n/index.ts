/**
 * Public surface of the i18n layer. Import locale primitives + types from
 * `@/lib/i18n`; get the React `useI18n` / `useT` hooks from
 * `@/providers/i18n-provider`.
 */
export {
  LOCALES,
  DEFAULT_LOCALE,
  LANG_STORAGE_KEY,
  LANG_EVENT,
  LOCALE_LABELS,
  LOCALE_SHORT,
  isLocale,
  type Locale,
} from "./config";
export { MESSAGES, type Messages } from "./messages";
export { translate, type MessageKey } from "./translate";
