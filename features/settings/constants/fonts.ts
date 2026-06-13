/**
 * Typeface options. Selecting one sets `data-font` on <html>; matching rules in
 * globals.css repoint the body font. `default` is the product font (Geist) and
 * needs no rule. Stacks use system fonts (no extra downloads) plus the bundled
 * Geist variables.
 */
export const FONTS = [
  { id: "default", label: "Default", stack: "var(--font-geist-sans)" },
  {
    id: "system",
    label: "System",
    stack: "ui-sans-serif, system-ui, sans-serif",
  },
  {
    id: "serif",
    label: "Serif",
    stack: 'ui-serif, Georgia, Cambria, "Times New Roman", serif',
  },
  {
    id: "mono",
    label: "Mono",
    stack: "var(--font-geist-mono), ui-monospace, monospace",
  },
] as const;

export type FontId = (typeof FONTS)[number]["id"];

export const DEFAULT_FONT_ID: FontId = "default";

/** localStorage key — kept in sync with the boot script in the root layout. */
export const FONT_STORAGE_KEY = "peoplor-font";

export function isFontId(value: unknown): value is FontId {
  return FONTS.some((font) => font.id === value);
}

/** Apply a font to <html> via `data-font` (CSS does the rest). */
export function applyFontValue(id: FontId): void {
  const root = document.documentElement;
  if (id === DEFAULT_FONT_ID) {
    delete root.dataset.font;
  } else {
    root.dataset.font = id;
  }
}
