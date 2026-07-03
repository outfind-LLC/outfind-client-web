/**
 * App preference contracts — mirror of the backend `UserSettingsView`
 * (`GET/PATCH /me/settings`). `language` lives on the User row server-side (it
 * also drives AI-generated content); everything else on the lazily-created
 * `UserSettings` row. These are the ONLY authoritative copies — localStorage is
 * never a source of truth for settings.
 */
import type {
  AppLanguage,
  AppTheme,
  JobAlertFrequency,
  ResumeVisibility,
} from "./enums";

export interface UserSettings {
  language: AppLanguage;

  // Appearance
  theme: AppTheme;
  accentColor: string;
  fontFamily: string;

  // Sound + composer
  soundEnabled: boolean;
  enterToSend: boolean;

  // Notifications
  notifMessages: boolean;
  notifStatus: boolean;
  notifJobs: boolean;
  notifEmail: boolean;
  jobAlertFrequency: JobAlertFrequency;

  // Privacy
  resumeVisibility: ResumeVisibility;
  showOnline: boolean;
  readReceipts: boolean;
  allowCalls: boolean;
  hiddenCompanies: string[];
}

/** Body for `PATCH /me/settings` — any subset; only provided keys are written. */
export type UpdateUserSettingsPayload = Partial<UserSettings>;
