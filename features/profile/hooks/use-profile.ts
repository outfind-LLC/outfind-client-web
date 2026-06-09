"use client";

import { useQuery } from "@tanstack/react-query";

import { qk } from "@/config/query-keys";
import { profileService } from "@/features/profile/services/profile.service";
import { isApiClientError } from "@/lib/api/error";
import type { EmployerProfile } from "@/interfaces/employer-profile.interface";
import type { WorkerProfile } from "@/interfaces/worker-profile.interface";

/**
 * Worker profile (enabled only for worker accounts). A 404 is an expected state
 * — the worker simply hasn't set up a profile yet — so we don't retry it; the
 * UI offers a guided setup instead.
 */
export function useWorkerProfile(enabled: boolean) {
  return useQuery<WorkerProfile>({
    queryKey: qk.workerProfile,
    queryFn: () => profileService.getWorkerProfile(),
    enabled,
    retry: (failureCount, error) => {
      if (isApiClientError(error) && error.status === 404) return false;
      return failureCount < 2;
    },
  });
}

/** Employer profile (enabled only for employer accounts). */
export function useEmployerProfile(enabled: boolean) {
  return useQuery<EmployerProfile>({
    queryKey: qk.employerProfile,
    queryFn: () => profileService.getEmployerProfile(),
    enabled,
  });
}
