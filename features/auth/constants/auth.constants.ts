/**
 * Auth feature constants — OAuth redirect param keys and the stable backend
 * error-code → user-facing message map. The backend redirects to the app root
 * with `?{provider}_auth=success|error` (+ `isNewUser` or `code`).
 */

/** Query param keys set by the backend on OAuth return. */
export const OAUTH_PARAMS = {
  google: "google_auth",
  telegram: "telegram_auth",
  isNewUser: "isNewUser",
  code: "code",
} as const;

export const OAUTH_RESULT = {
  success: "success",
  error: "error",
} as const;

/**
 * Stable backend auth error codes → localisable copy. Keep in sync with the
 * backend `AUTH_ERROR_CODES`; unknown codes fall back to a generic message.
 */
export const AUTH_ERROR_MESSAGES: Record<string, string> = {
  PROVIDER_CONFLICT:
    "This account already exists with a different sign-in method. Try the other provider.",
  USER_INACTIVE: "Your account is inactive. Please contact support.",
  ACCOUNT_TYPE_REQUIRED:
    "Please choose whether you're a worker or an employer.",
  ACCOUNT_TYPE_FORBIDDEN: "That account type isn't available for sign-up.",
  OAUTH_STATE_INVALID: "Your sign-in session expired. Please try again.",
  AUTH_FAILED: "Sign-in failed. Please try again.",
};

export const DEFAULT_AUTH_ERROR = "We couldn't sign you in. Please try again.";

export function resolveAuthErrorMessage(code: string | null): string {
  if (!code) return DEFAULT_AUTH_ERROR;
  return AUTH_ERROR_MESSAGES[code] ?? DEFAULT_AUTH_ERROR;
}
