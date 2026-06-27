import "server-only";
import { cache } from "react";
import { cookies } from "next/headers";

import { env } from "@/lib/env";
import type { SessionUser } from "@/interfaces/auth.interface";
import { parseEnvelope } from "./parse";
import { ApiClientError } from "./error";

/**
 * Server Component / Server Action fetch.
 *
 * Forwards the incoming request's cookies to the backend (the Next server can
 * read the host-scoped `access_token` cookie). Does NOT auto-refresh — token
 * rotation requires writing cookies, which RSC cannot do; expired sessions are
 * refreshed on the client. Defaults to `no-store` (auth-scoped data).
 */
interface ServerRequestOptions {
  method?: string;
  body?: unknown;
  cache?: RequestCache;
  next?: NextFetchRequestConfig;
}

export async function serverApiFetch<T>(
  path: string,
  options: ServerRequestOptions = {},
): Promise<T> {
  const cookieStore = await cookies();
  const cookieHeader = cookieStore.toString();
  const url = path.startsWith("http")
    ? path
    : `${env.NEXT_PUBLIC_API_URL}${path}`;

  const res = await fetch(url, {
    method: options.method ?? "GET",
    headers: {
      ...(options.body !== undefined
        ? { "Content-Type": "application/json" }
        : {}),
      ...(cookieHeader ? { cookie: cookieHeader } : {}),
    },
    body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
    cache: options.cache ?? "no-store",
    next: options.next,
  });

  return parseEnvelope<T>(res);
}

/**
 * Resolve the current user server-side, or `null` when unauthenticated.
 * `cache()`-wrapped so the `(app)` layout and a nested role-guard group layout
 * share a single `/auth/me` call per request instead of fetching twice.
 */
export const getServerSession = cache(
  async (): Promise<SessionUser | null> => {
    try {
      return await serverApiFetch<SessionUser>("/auth/me");
    } catch (error) {
      if (error instanceof ApiClientError && error.status === 401) {
        return null;
      }
      return null;
    }
  },
);
