"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { qk } from "@/config/query-keys";
import { profileService } from "@/features/profile/services/profile.service";
import type {
  CreateEmployerProfilePayload,
  UpdateEmployerProfilePayload,
} from "@/interfaces/employer-profile.interface";

/** Create the company profile. Also refreshes the session so the
 * `isEmployerProfileSet` gate flips and the profile page renders the view. */
export function useCreateEmployerProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateEmployerProfilePayload) =>
      profileService.createEmployerProfile(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: qk.employerProfile });
      queryClient.invalidateQueries({ queryKey: qk.session });
    },
  });
}

/** Update the company profile. */
export function useUpdateEmployerProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: UpdateEmployerProfilePayload) =>
      profileService.updateEmployerProfile(payload),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: qk.employerProfile }),
  });
}

/** Toggle whether the company profile (and its vacancies) is publicly active. */
export function useSetEmployerProfileActive() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (isActive: boolean) =>
      profileService.setEmployerProfileActive(isActive),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: qk.employerProfile }),
  });
}

/**
 * Parse a spoken/typed company description into onboarding-form fields.
 * Persists nothing (no cache to invalidate) — the caller prefills the form.
 */
export function useParseCompanyProfile() {
  return useMutation({
    mutationFn: (text: string) => profileService.parseCompanyProfile(text),
  });
}

/** Delete the company profile. Refreshes the session gate too. */
export function useDeleteEmployerProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => profileService.deleteEmployerProfile(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: qk.employerProfile });
      queryClient.invalidateQueries({ queryKey: qk.session });
    },
  });
}
