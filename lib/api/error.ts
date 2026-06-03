import type { ApiErrorBody } from "@/interfaces/api.interface";

/**
 * Normalised client-side error for any failed API call.
 * Carries the backend `code` (stable, switchable) and field-level validation
 * errors so forms can surface them inline.
 */
export class ApiClientError extends Error {
  readonly status: number;
  readonly code: string;
  readonly fields?: Record<string, string[]>;

  constructor(status: number, body: ApiErrorBody) {
    super(body.message);
    this.name = "ApiClientError";
    this.status = status;
    this.code = body.code;
    this.fields = body.fields;
  }

  get isUnauthorized(): boolean {
    return this.status === 401;
  }

  get isForbidden(): boolean {
    return this.status === 403;
  }

  /** 402 (budget) / 403 (locked) / 429 (quota) — the plan-gate responses. */
  get isPlanLimited(): boolean {
    return this.status === 402 || this.status === 403 || this.status === 429;
  }
}

export function isApiClientError(error: unknown): error is ApiClientError {
  return error instanceof ApiClientError;
}
