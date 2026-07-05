import type { Locale } from "@/lib/i18n/config";
import type { LocalizedText } from "@/features/visa/types";

/** Resolve a `{ uz, ru, en }` block for the active locale, falling back through
 * the other languages so a partially-translated entry still renders. */
export function pickLoc(
  text: LocalizedText | null | undefined,
  locale: Locale,
): string {
  if (!text) return "";
  return (
    text[locale]?.trim() ||
    text.en?.trim() ||
    text.ru?.trim() ||
    text.uz?.trim() ||
    ""
  );
}
