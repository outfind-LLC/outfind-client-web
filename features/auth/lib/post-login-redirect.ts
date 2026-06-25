/**
 * Where to land after sign-in. Persisted in localStorage so it survives the
 * full-page OAuth round-trip (Google leaves the SPA entirely). Set when the proxy
 * bounces a signed-out user into the sign-in modal; consumed once login completes.
 *
 * Only same-origin absolute paths are accepted (`/foo`, never `//evil.com` or
 * `https://…`) so a crafted `?redirect=` can't become an open redirect.
 */
const STORAGE_KEY = "peoplor_post_login_redirect";

function isSafeInternalPath(path: string | null | undefined): path is string {
  return (
    typeof path === "string" &&
    path.startsWith("/") &&
    !path.startsWith("//")
  );
}

export function setPostLoginRedirect(path: string | null | undefined): void {
  try {
    if (isSafeInternalPath(path)) localStorage.setItem(STORAGE_KEY, path);
    else localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Ignore storage failures (private mode etc.).
  }
}

/** Read the stored target (once), clearing it; falls back when absent/unsafe. */
export function consumePostLoginRedirect(fallback: string): string {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    localStorage.removeItem(STORAGE_KEY);
    if (isSafeInternalPath(stored)) return stored;
  } catch {
    // Ignore storage failures.
  }
  return fallback;
}
