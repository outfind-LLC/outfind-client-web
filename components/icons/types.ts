/**
 * Central icon registry — shared types.
 *
 * Every icon lives in its own file under `components/icons/` and default-exports
 * an `IconDef`: the prototype's exact inner SVG markup plus how to wrap it.
 * `registry.ts` turns each def into a CSS-mask data-uri so the whole app keeps
 * the mask-icon technique (`.ic { mask: var(--i) }`) — pixel-identical to the
 * `_Peoplor_Design` prototype. Render via the shared `<Icon name="…" />`.
 */
export type IconDef =
  /** Stroke glyph: `inner` paths, `sw` stroke-width (default 1.5), round caps/joins. */
  | { inner: string; sw?: number; fill?: false }
  /** Solid glyph: `inner` paths filled (no stroke). */
  | { inner: string; fill: true }
  /** Escape hatch for multi-colour / pre-built marks: a ready `url("data:…")` value. */
  | { raw: string };
