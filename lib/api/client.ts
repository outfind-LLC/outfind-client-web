import { env } from "@/lib/env";
import { readStoredLocale } from "@/lib/i18n/store";
import { parseEnvelope } from "./parse";

/**
 * Browser-side typed fetch.
 *
 * - Sends httpOnly auth cookies (`credentials: "include"`); the backend reads
 *   the `access_token` cookie or `Authorization` header.
 * - On a 401 it transparently rotates the session via `POST /auth/refresh`
 *   (single-flight — concurrent 401s share one refresh) and retries once.
 * - Unwraps the response envelope, returning `data` or throwing ApiClientError.
 */
interface RequestOptions extends Omit<RequestInit, "body"> {
  body?: unknown;
  /** Skip the auto-refresh + retry (used by the refresh call itself). */
  skipAuthRefresh?: boolean;
}

let refreshPromise: Promise<boolean> | null = null;

function resolveUrl(path: string): string {
  return path.startsWith("http") ? path : `${env.NEXT_PUBLIC_API_URL}${path}`;
}

/**
 * Rotate the session cookies via `POST /auth/refresh`. Single-flight: every
 * caller in this tab (typed fetches AND the chat stream transport) shares one
 * in-flight refresh, so a burst of 401s never races the rotation. Exported so
 * non-`apiFetch` transports (the chat stream) reuse the SAME promise instead
 * of firing their own refresh.
 */
export async function refreshSession(): Promise<boolean> {
  if (!refreshPromise) {
    refreshPromise = fetch(`${env.NEXT_PUBLIC_API_URL}/auth/refresh`, {
      method: "POST",
      credentials: "include",
    })
      .then((res) => res.ok)
      .catch(() => false)
      .finally(() => {
        refreshPromise = null;
      });
  }
  return refreshPromise;
}

/**
 * `fetch` with the same transparent 401 → refresh → retry-once behaviour as
 * `apiFetch`, for callers that need the raw Response (streaming). Auth rides
 * on httpOnly cookies, so retrying the same init is safe.
 */
export async function fetchWithAuthRetry(
  input: string | URL | Request,
  init?: RequestInit,
): Promise<Response> {
  let res = await fetch(input, init);
  if (res.status === 401) {
    const refreshed = await refreshSession();
    if (refreshed) {
      res = await fetch(input, init);
    }
  }
  return res;
}

function buildInit({ body, headers, ...rest }: RequestOptions): RequestInit {
  return {
    ...rest,
    credentials: "include",
    headers: {
      // The active UI language (browser-detected by default) so the backend can
      // localise all communication — AI replies, emails, error messages.
      "X-App-Language": readStoredLocale(),
      ...(body !== undefined ? { "Content-Type": "application/json" } : {}),
      ...headers,
    },
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
  };
}

export async function apiFetch<T>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const { skipAuthRefresh, ...rest } = options;
  const url = resolveUrl(path);
  const init = buildInit(rest);

  let res = await fetch(url, init);

  if (res.status === 401 && !skipAuthRefresh) {
    const refreshed = await refreshSession();
    if (refreshed) {
      res = await fetch(url, init);
    }
  }

  return parseEnvelope<T>(res);
}

export const api = {
  get: <T>(path: string, options?: RequestOptions) =>
    apiFetch<T>(path, { ...options, method: "GET" }),
  post: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    apiFetch<T>(path, { ...options, method: "POST", body }),
  patch: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    apiFetch<T>(path, { ...options, method: "PATCH", body }),
  put: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    apiFetch<T>(path, { ...options, method: "PUT", body }),
  delete: <T>(path: string, options?: RequestOptions) =>
    apiFetch<T>(path, { ...options, method: "DELETE" }),
};
