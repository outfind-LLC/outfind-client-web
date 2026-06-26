import type { IconDef } from "./types";
import bookmark from "./bookmark";
import docCheck from "./doc-check";

/**
 * The icon registry. Add a glyph by dropping `components/icons/<name>.ts` (a
 * default-exported `IconDef`) and registering it here. Names must be unique per
 * glyph — where the legacy per-feature sets reused a name for a *different* shape,
 * register both under distinct names and alias them at the call site.
 */
const DEFS = {
  bookmark,
  docCheck,
} satisfies Record<string, IconDef>;

export type IconName = keyof typeof DEFS;

/** Build the CSS-mask data-uri for one def (kept identical to the prototype). */
function toMask(def: IconDef): string {
  if ("raw" in def) return def.raw;
  const svg = def.fill
    ? `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='black'>${def.inner}</svg>`
    : `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='black' stroke-width='${def.sw ?? 1.5}' stroke-linecap='round' stroke-linejoin='round'>${def.inner}</svg>`;
  return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;
}

/** name → `url("data:image/svg+xml,…")`, ready for `style={{ "--i": ICONS[name] }}`. */
export const ICONS = Object.fromEntries(
  (Object.entries(DEFS) as [IconName, IconDef][]).map(([name, def]) => [name, toMask(def)]),
) as Record<IconName, string>;
