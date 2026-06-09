/**
 * Accent themes. Selecting one sets `data-accent` on <html>; matching CSS rules
 * in globals.css re-point the brand / primary / ring / sidebar tokens so the
 * whole UI recolours. `indigo` is the product default and maps to the base
 * tokens (no override rule needed). The `swatch` is what the picker renders.
 */
export const ACCENTS = [
  { id: "indigo", label: "Indigo", swatch: "#4a49cf" },
  { id: "blue", label: "Blue", swatch: "#2563eb" },
  { id: "violet", label: "Violet", swatch: "#7c3aed" },
  { id: "emerald", label: "Emerald", swatch: "#10b981" },
  { id: "teal", label: "Teal", swatch: "#14b8a6" },
  { id: "rose", label: "Rose", swatch: "#f43f5e" },
  { id: "orange", label: "Orange", swatch: "#f97316" },
] as const;

export type AccentId = (typeof ACCENTS)[number]["id"];

export const DEFAULT_ACCENT_ID: AccentId = "indigo";

/** localStorage key — kept in sync with the boot script in the root layout. */
export const ACCENT_STORAGE_KEY = "jobsterr-accent";

export function isAccentId(value: unknown): value is AccentId {
  return ACCENTS.some((accent) => accent.id === value);
}
