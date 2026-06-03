import type { ApiEnvelope } from "@/interfaces/api.interface";
import { ApiClientError } from "./error";

/**
 * Unwrap a backend response envelope.
 * Returns `data` on success; throws `ApiClientError` (carrying the stable
 * `code`) on any non-2xx or `success: false` payload. Shared by the browser
 * and server fetch helpers so error handling is identical everywhere.
 */
export async function parseEnvelope<T>(res: Response): Promise<T> {
  if (res.status === 204) {
    return undefined as T;
  }

  const text = await res.text();
  let json: ApiEnvelope<T> | null = null;

  if (text) {
    try {
      json = JSON.parse(text) as ApiEnvelope<T>;
    } catch {
      json = null;
    }
  }

  if (!res.ok || !json || json.success === false) {
    throw new ApiClientError(res.status, {
      code: json?.error?.code ?? `HTTP_${res.status}`,
      message:
        json?.error?.message ??
        res.statusText ??
        "Something went wrong. Please try again.",
      fields: json?.error?.fields,
    });
  }

  return json.data as T;
}
