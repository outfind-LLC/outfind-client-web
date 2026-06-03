import type { AccountType, AppLanguage, AuthProvider } from "./enums";

/**
 * Authenticated user as returned by `GET /auth/me` (backend `MeUser`).
 * `null` email/avatar covers Telegram-only accounts.
 */
export interface SessionUser {
  id: string;
  email: string | null;
  name: string;
  avatarUrl: string | null;
  userCode: string;
  accountType: AccountType;
  language: AppLanguage;
  provider: AuthProvider;
  telegramUsername: string | null;
  isActive: boolean;
  isWorkerProfileSet: boolean;
  isEmployerProfileSet: boolean;
}

/** Result of the Telegram SPA login (`POST /auth/telegram`) — user + token. */
export interface TelegramLoginResult extends SessionUser {
  isNewUser?: boolean;
  accessToken: string;
}
