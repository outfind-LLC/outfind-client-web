import { api } from "@/lib/api/client";
import { buildQuery } from "@/lib/api/query";
import { env } from "@/lib/env";
import type {
  SessionUser,
  TelegramLoginResult,
} from "@/interfaces/auth.interface";
import type { AccountType } from "@/interfaces/enums";
import { ACCOUNT_TYPE } from "@/interfaces/enums";

/**
 * Auth API service — the single client-side gateway to the backend auth module.
 *
 * OAuth start endpoints are full-page browser navigations (the backend sets
 * httpOnly cookies then redirects back), so those are exposed as URL builders
 * rather than fetches. Everything else is a normal cookie-authenticated request.
 */

/** Account types a user may self-register / switch to (ADMIN is excluded). */
export type RegistrationAccountType = Extract<
  AccountType,
  typeof ACCOUNT_TYPE.WORKER | typeof ACCOUNT_TYPE.EMPLOYER
>;

/** Telegram Login Widget payload (passed through to the backend for HMAC checks). */
export interface TelegramWidgetPayload {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  photo_url?: string;
  auth_date: number;
  hash: string;
}

export const authService = {
  /** Resolve the current session, or `null` when unauthenticated. */
  async getSession(): Promise<SessionUser> {
    return api.get<SessionUser>("/auth/me");
  },

  /** Telegram SPA login — sets cookies and returns the user + access token. */
  async loginWithTelegram(
    payload: TelegramWidgetPayload,
    accountType: RegistrationAccountType,
  ): Promise<TelegramLoginResult> {
    return api.post<TelegramLoginResult>("/auth/telegram", {
      ...payload,
      accountType,
    });
  },

  /** Set the account type after an OAuth signup that left it unresolved. */
  async setAccountType(
    accountType: RegistrationAccountType,
  ): Promise<SessionUser> {
    return api.patch<SessionUser>("/auth/me/account-type", { accountType });
  },

  /** Switch the active account between WORKER and EMPLOYER (rotates tokens). */
  async switchAccount(
    to: RegistrationAccountType,
  ): Promise<{ user: SessionUser; accessToken: string }> {
    return api.post<{ user: SessionUser; accessToken: string }>(
      "/auth/me/switch-account",
      { to },
    );
  },

  /** Revoke the refresh token and clear cookies. */
  async logout(): Promise<null> {
    return api.post<null>("/auth/logout");
  },

  /** Full-page redirect URL that begins Google OAuth for the chosen role. */
  googleAuthUrl(accountType: RegistrationAccountType): string {
    return `${env.NEXT_PUBLIC_API_URL}/auth/google${buildQuery({ accountType })}`;
  },

  /** Backend callback URL for the Telegram redirect flow (widget `auth-url`). */
  telegramCallbackUrl(accountType: RegistrationAccountType): string {
    return `${env.NEXT_PUBLIC_API_URL}/auth/telegram/callback${buildQuery({ accountType })}`;
  },
};
