/**
 * UI-value ↔ API-enum maps for the settings surface. The app UI speaks
 * lowercase (`"en"`, next-themes' `"dark"`), the backend speaks Prisma enums
 * (`EN`, `DARK`) — these are the only translation points.
 */
import {
  APP_LANGUAGE,
  APP_THEME,
  type AppLanguage,
  type AppTheme,
} from "@/interfaces/enums";
import type { Locale } from "@/lib/i18n/config";

const LOCALE_TO_LANGUAGE: Record<Locale, AppLanguage> = {
  en: APP_LANGUAGE.EN,
  ru: APP_LANGUAGE.RU,
  uz: APP_LANGUAGE.UZ,
};

const LANGUAGE_TO_LOCALE: Record<AppLanguage, Locale> = {
  EN: "en",
  RU: "ru",
  UZ: "uz",
};

export function toAppLanguage(locale: Locale): AppLanguage {
  return LOCALE_TO_LANGUAGE[locale];
}

export function fromAppLanguage(language: AppLanguage): Locale {
  return LANGUAGE_TO_LOCALE[language] ?? "en";
}

/** next-themes value ("light" | "dark" | "system") → APP_THEME, null if unknown. */
export function toAppTheme(theme: string): AppTheme | null {
  switch (theme) {
    case "light":
      return APP_THEME.LIGHT;
    case "dark":
      return APP_THEME.DARK;
    case "system":
      return APP_THEME.SYSTEM;
    default:
      return null;
  }
}

export function fromAppTheme(theme: AppTheme): "light" | "dark" | "system" {
  switch (theme) {
    case APP_THEME.LIGHT:
      return "light";
    case APP_THEME.DARK:
      return "dark";
    default:
      return "system";
  }
}
