/**
 * Mirrors the backend response envelope (`src/common/response/api-response.ts`).
 * Every endpoint returns this shape; the API client unwraps `data` on success
 * and throws `ApiClientError` built from `error` on failure.
 */
export interface ApiErrorBody {
  code: string;
  message: string;
  fields?: Record<string, string[]>;
}

export interface ApiEnvelope<T> {
  success: boolean;
  data: T | null;
  error?: ApiErrorBody | null;
  meta?: Record<string, unknown>;
}

/** Cursor pagination wrapper used by list endpoints (conversations, jobs, …). */
export interface CursorPage<T> {
  items: T[];
  nextCursor: string | null;
}
