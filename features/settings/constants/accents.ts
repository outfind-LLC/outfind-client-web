/**
 * Accent themes. The active accent is either a named preset (sets `data-accent`
 * on <html>, matched by the rules in globals.css) or a custom hex colour
 * (applied directly as inline CSS variables). Either way the whole UI recolours
 * because every `--color-*` token maps back to these via `@theme inline`.
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

/** The active accent: a preset id or a `#rrggbb` custom colour. */
export type AccentValue = AccentId | (string & {});

export const DEFAULT_ACCENT_ID: AccentId = "indigo";

/** localStorage key — kept in sync with the boot script in the root layout. */
export const ACCENT_STORAGE_KEY = "peoplor-accent";

export function isAccentId(value: unknown): value is AccentId {
  return ACCENTS.some((accent) => accent.id === value);
}

/** A valid `#rrggbb` hex colour. */
export function isHexColor(value: unknown): value is string {
  return typeof value === "string" && /^#[0-9a-fA-F]{6}$/.test(value);
}

/** A valid stored accent value (preset id or hex). */
export function isAccentValue(value: unknown): value is AccentValue {
  return isAccentId(value) || isHexColor(value);
}

/**
 * Pick a readable foreground (near-black vs white) for a hex background using a
 * simple perceived-luminance check — keeps button text legible on any colour.
 */
export function readableForeground(hex: string): string {
  const n = parseInt(hex.slice(1), 16);
  const r = (n >> 16) & 255;
  const g = (n >> 8) & 255;
  const b = n & 255;
  const luminance = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
  return luminance > 0.6 ? "#0a0a0f" : "#ffffff";
}

/** Brand/primary tokens we set inline for a custom colour (cleared for presets). */
const CUSTOM_VARS = [
  "--primary",
  "--brand",
  "--brand-2",
  "--ring",
  "--sidebar-primary",
  "--sidebar-ring",
  "--primary-foreground",
  "--sidebar-primary-foreground",
  "--accent",
  "--accent-foreground",
  "--sidebar-accent",
  "--sidebar-accent-foreground",
] as const;

/**
 * Apply an accent to <html>. A preset sets `data-accent` (CSS does the rest); a
 * custom hex sets the brand tokens inline with a readable foreground and soft
 * tints derived via color-mix. Shared shape with the boot script in the layout.
 */
export function applyAccentValue(value: AccentValue): void {
  const root = document.documentElement;
  const style = root.style;

  if (isHexColor(value)) {
    const fg = readableForeground(value);
    const tint = `color-mix(in oklab, ${value} 14%, var(--background))`;
    style.setProperty("--primary", value);
    style.setProperty("--brand", value);
    style.setProperty("--brand-2", value);
    style.setProperty("--ring", value);
    style.setProperty("--sidebar-primary", value);
    style.setProperty("--sidebar-ring", value);
    style.setProperty("--primary-foreground", fg);
    style.setProperty("--sidebar-primary-foreground", fg);
    style.setProperty("--accent", tint);
    style.setProperty("--accent-foreground", value);
    style.setProperty("--sidebar-accent", tint);
    style.setProperty("--sidebar-accent-foreground", value);
    delete root.dataset.accent;
    return;
  }

  // Preset: clear any inline custom tokens, let the CSS preset rule take over.
  for (const name of CUSTOM_VARS) style.removeProperty(name);
  root.dataset.accent = value;
}
