"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { qk } from "@/config/query-keys";
import { applicationsService } from "@/features/applications/services/applications.service";
import type { ShortlistCandidate } from "@/interfaces/candidate.interface";

/** Employer: saved candidates (`GET /employer/shortlist`). */
export function useEmployerShortlist(enabled: boolean) {
  return useQuery<ShortlistCandidate[]>({
    queryKey: qk.shortlist,
    queryFn: () => applicationsService.listShortlist(),
    enabled,
  });
}

/** Employer: save a candidate (keyed by worker profile id). */
export function useAddToShortlist() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (candidateId: string) =>
      applicationsService.addToShortlist(candidateId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: qk.shortlist }),
  });
}

/** Employer: remove a saved candidate. */
export function useRemoveFromShortlist() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (candidateId: string) =>
      applicationsService.removeFromShortlist(candidateId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: qk.shortlist }),
  });
}
