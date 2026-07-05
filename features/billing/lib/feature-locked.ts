import { isApiClientError } from "@/lib/api/error";

/** The two plan-gate error codes the backend returns with a 403. */
export type FeatureLockCode = "FEATURE_LOCKED" | "LIMIT_REACHED";

/** Known feature keys, matched inside error payloads to preselect the modal. */
const FEATURE_KEY_PATTERN =
  /\b(ai_cv_builder|ai_job_search|ai_assistant|visa_guidance|ai_messages_monthly|cv_limit)\b/;

/** Flatten any error into searchable text (code + message + raw body). */
function errorText(error: unknown): string {
  if (isApiClientError(error)) {
    const fields = error.fields ? JSON.stringify(error.fields) : "";
    return `${error.code} ${error.message} ${fields}`;
  }
  if (error instanceof Error) return error.message;
  return typeof error === "string" ? error : "";
}

/**
 * Which plan-gate code (if any) an error carries. Handles both the normalised
 * `ApiClientError` (REST catch sites) and raw transport errors whose message is
 * the response body text (the AI-SDK chat stream).
 */
export function extractLockCode(error: unknown): FeatureLockCode | null {
  if (isApiClientError(error)) {
    return error.code === "FEATURE_LOCKED" || error.code === "LIMIT_REACHED"
      ? error.code
      : null;
  }
  const text = errorText(error);
  if (text.includes("FEATURE_LOCKED")) return "FEATURE_LOCKED";
  if (text.includes("LIMIT_REACHED")) return "LIMIT_REACHED";
  return null;
}

/**
 * Central 403 hook-in for catch sites: when `error` is a `FEATURE_LOCKED` /
 * `LIMIT_REACHED` plan-gate response, open the upgrade modal (with the feature
 * key parsed from the error details, else `fallbackFeature`) and return true so
 * the caller can skip its generic error toast.
 */
export function handleFeatureLockedError(
  error: unknown,
  openModal: (feature?: string) => void,
  fallbackFeature?: string,
): boolean {
  const code = extractLockCode(error);
  if (!code) return false;
  const match = errorText(error).match(FEATURE_KEY_PATTERN);
  openModal(match?.[1] ?? fallbackFeature);
  return true;
}
