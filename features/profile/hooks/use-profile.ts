"use client";

import { useQuery } from "@tanstack/react-query";

import { qk } from "@/config/query-keys";
import { profileService } from "@/features/profile/services/profile.service";
import type { EmployerProfile } from "@/interfaces/employer-profile.interface";
import type { WorkerProfile } from "@/interfaces/worker-profile.interface";

/** Worker profile (enabled only for worker accounts). */
export function useWorkerProfile(enabled: boolean) {
  return useQuery<WorkerProfile>({
    queryKey: qk.workerProfile,
    queryFn: () => profileService.getWorkerProfile(),
    enabled,
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
