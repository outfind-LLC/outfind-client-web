"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { qk } from "@/config/query-keys";
import { cvService } from "@/features/cv/services/cv.service";
import type { CvView, UpdateCvPayload } from "@/interfaces/cv.interface";

/** The worker's CV (null before the first generation). */
export function useMyCv(enabled = true) {
  return useQuery<CvView | null>({
    queryKey: qk.myCv,
    queryFn: () => cvService.getMine(),
    enabled,
  });
}

/** AI-generate (or regenerate) the CV from the stored profile. */
export function useGenerateCv() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => cvService.generate(),
    onSuccess: (cv) => queryClient.setQueryData(qk.myCv, cv),
  });
}

/** Persist template / sharing / content edits. */
export function useUpdateCv() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: UpdateCvPayload) => cvService.update(payload),
    onSuccess: (cv) => queryClient.setQueryData(qk.myCv, cv),
  });
}
