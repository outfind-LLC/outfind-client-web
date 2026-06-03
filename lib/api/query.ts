/**
 * Build a URL query string from a params object, skipping `undefined`/`null`.
 * Returns `""` when nothing is set, otherwise a leading-`?` string. Only
 * string/number/boolean values are serialised (booleans as `"true"`/`"false"`
 * to match the backend's explicit parsing); anything else is ignored.
 *
 * Generic over `object` so typed query interfaces (which lack an implicit index
 * signature) pass without the caller casting.
 */
export function buildQuery<T extends object>(params: T): string {
  const search = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null) continue;
    if (
      typeof value === "string" ||
      typeof value === "number" ||
      typeof value === "boolean"
    ) {
      search.set(key, String(value));
    }
  }

  const queryString = search.toString();
  return queryString ? `?${queryString}` : "";
}
