"use client";

import { useCallback } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { qk } from "@/config/query-keys";
import { useSession } from "@/features/auth/hooks/use-session";
import { settingsService } from "@/features/settings/services/settings.service";
import { toAppLanguage } from "@/features/settings/lib/settings-maps";
import { isApiClientError } from "@/lib/api/error";
import type { Locale } from "@/lib/i18n/config";
import { useI18n } from "@/providers/i18n-provider";
import type {
  UpdateUserSettingsPayload,
  UserSettings,
} from "@/interfaces/user-settings.interface";

/** The user's app preferences from `GET /me/settings` (authenticated only). */
export function useUserSettings(enabled: boolean) {
  return useQuery<UserSettings>({
    queryKey: qk.userSettings,
    queryFn: () => settingsService.getMySettings(),
    enabled,
    staleTime: 60 * 1000,
  });
}

/**
 * Optimistic `PATCH /me/settings` — the cache flips instantly so toggles feel
 * immediate; a failure rolls back and toasts.
 */
export function useUpdateSettings() {
  const queryClient = useQueryClient();
  const { t } = useI18n();
  return useMutation({
    mutationFn: (patch: UpdateUserSettingsPayload) =>
      settingsService.updateMySettings(patch),
    onMutate: async (patch) => {
      await queryClient.cancelQueries({ queryKey: qk.userSettings });
      const previous = queryClient.getQueryData<UserSettings>(qk.userSettings);
      if (previous) {
        queryClient.setQueryData<UserSettings>(qk.userSettings, {
          ...previous,
          ...patch,
        });
      }
      return { previous };
    },
    onError: (error, _patch, context) => {
      if (context?.previous) {
        queryClient.setQueryData(qk.userSettings, context.previous);
      }
      toast.error(
        isApiClientError(error) ? error.message : t("settings.saveError"),
      );
    },
    onSuccess: (settings) => {
      queryClient.setQueryData(qk.userSettings, settings);
    },
  });
}

/**
 * The one way to switch the app language: applies locally (instant, every
 * `useSyncExternalStore` reader updates) AND persists to the account on the
 * backend when signed in. Use this from every in-app language picker.
 */
export function useSetAppLanguage() {
  const { setLocale } = useI18n();
  const { isAuthenticated } = useSession();
  const update = useUpdateSettings();
  const { mutate } = update;

  return useCallback(
    (locale: Locale) => {
      setLocale(locale);
      if (isAuthenticated) mutate({ language: toAppLanguage(locale) });
    },
    [setLocale, isAuthenticated, mutate],
  );
}
