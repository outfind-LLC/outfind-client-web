"use client";

import { useQuery } from "@tanstack/react-query";

import { qk } from "@/config/query-keys";
import { applicationsService } from "@/features/applications/services/applications.service";
import type { CandidateProfile } from "@/interfaces/candidate-profile.interface";

/**
 * Full candidate profile for an applicant. Backed by a PROPOSED endpoint that may
 * not exist yet, so we don't retry — a failure (404/501) simply means the rich
 * profile isn't available and the page falls back to the applicant-list data.
 * Callers should treat `isError` as "rich data unavailable", not as a problem to
 * surface.
 */
export function useCandidateProfile(applicationId: string) {
  return useQuery<CandidateProfile>({
    queryKey: qk.candidateProfile(applicationId),
    queryFn: () => applicationsService.getCandidateProfile(applicationId),
    enabled: Boolean(applicationId),
    retry: false,
    staleTime: 60_000,
  });
}
