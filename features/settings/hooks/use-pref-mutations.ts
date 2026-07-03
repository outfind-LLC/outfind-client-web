"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { qk } from "@/config/query-keys";
import {
  profileService,
  type UpdateProfileInfoInput,
} from "@/features/profile/services/profile.service";
import { isApiClientError } from "@/lib/api/error";
import { useI18n } from "@/providers/i18n-provider";
import type {
  EmployerProfile,
  UpdateEmployerProfilePayload,
} from "@/interfaces/employer-profile.interface";
import type { WorkerProfile } from "@/interfaces/worker-profile.interface";

/**
 * Settings → Job search rows persist onto the worker profile
 * (`PATCH /worker/profile`). Optimistic so toggles flip instantly; a failure
 * rolls back and toasts.
 */
export function useUpdateWorkerPrefs() {
  const queryClient = useQueryClient();
  const { t } = useI18n();
  return useMutation({
    mutationFn: (patch: UpdateProfileInfoInput) =>
      profileService.updateProfileInfo(patch),
    onMutate: async (patch) => {
      await queryClient.cancelQueries({ queryKey: qk.workerProfile });
      const previous = queryClient.getQueryData<WorkerProfile>(
        qk.workerProfile,
      );
      if (previous) {
        // The input type is a wire-format superset (plain strings for enums),
        // but the keys patched from Settings map 1:1 onto profile fields.
        queryClient.setQueryData<WorkerProfile>(qk.workerProfile, {
          ...previous,
          ...(patch as unknown as Partial<WorkerProfile>),
        });
      }
      return { previous };
    },
    onError: (error, _patch, context) => {
      if (context?.previous) {
        queryClient.setQueryData(qk.workerProfile, context.previous);
      }
      toast.error(
        isApiClientError(error) ? error.message : t("settings.saveError"),
      );
    },
    onSuccess: (profile) => {
      queryClient.setQueryData(qk.workerProfile, profile);
    },
  });
}

/**
 * Settings → Hiring rows persist onto the company profile
 * (`PATCH /employer/profile`). Same optimistic pattern as the worker side.
 */
export function useUpdateHiringPrefs() {
  const queryClient = useQueryClient();
  const { t } = useI18n();
  return useMutation({
    mutationFn: (patch: UpdateEmployerProfilePayload) =>
      profileService.updateEmployerProfile(patch),
    onMutate: async (patch) => {
      await queryClient.cancelQueries({ queryKey: qk.employerProfile });
      const previous = queryClient.getQueryData<EmployerProfile>(
        qk.employerProfile,
      );
      if (previous) {
        queryClient.setQueryData<EmployerProfile>(qk.employerProfile, {
          ...previous,
          ...patch,
        } as EmployerProfile);
      }
      return { previous };
    },
    onError: (error, _patch, context) => {
      if (context?.previous) {
        queryClient.setQueryData(qk.employerProfile, context.previous);
      }
      toast.error(
        isApiClientError(error) ? error.message : t("settings.saveError"),
      );
    },
    onSuccess: (profile) => {
      queryClient.setQueryData(qk.employerProfile, profile);
    },
  });
}
