"use client";

import { useEffect, useRef } from "react";
import { useTheme } from "next-themes";

import { useSession } from "@/features/auth/hooks/use-session";
import { useUserSettings } from "@/features/settings/hooks/use-user-settings";
import {
  fromAppLanguage,
  fromAppTheme,
} from "@/features/settings/lib/settings-maps";
import { setSoundState } from "@/features/settings/lib/play-sound";
import { setStoredLocale } from "@/lib/i18n/store";

/**
 * Applies the account's server-side settings (`GET /me/settings`) to this
 * device once per sign-in: language, theme, and the sound gate. The database is
 * the source of truth — whatever this device last showed is overwritten by the
 * account's saved preferences. Renders nothing; mounted once in AppProviders.
 *
 * Writes go the other way at the source: every picker persists through
 * `useSetAppLanguage` / `useUpdateSettings`, so there is nothing to push here.
 */
export function SettingsSync() {
  const { isAuthenticated } = useSession();
  const { data } = useUserSettings(isAuthenticated);
  const { setTheme } = useTheme();
  const pulled = useRef(false);

  // Re-arm the pull when the user signs out, so the next account's settings
  // apply on sign-in (not just on a full page load).
  useEffect(() => {
    if (!isAuthenticated) pulled.current = false;
  }, [isAuthenticated]);

  // Pull once per sign-in: server copy wins over whatever this device had.
  useEffect(() => {
    if (!data || pulled.current) return;
    pulled.current = true;
    setStoredLocale(fromAppLanguage(data.language));
    setTheme(fromAppTheme(data.theme));
  }, [data, setTheme]);

  // Keep the in-memory sound gate current on every settle (cheap, no write-back).
  useEffect(() => {
    if (data) setSoundState({ enabled: data.soundEnabled });
  }, [data]);

  return null;
}
