import { env } from "@/lib/env";
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

async function refreshSession(): Promise<boolean> {
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

function buildInit({ body, headers, ...rest }: RequestOptions): RequestInit {
  return {
    ...rest,
    credentials: "include",
    headers: {
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
