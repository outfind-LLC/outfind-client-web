"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { qk } from "@/config/query-keys";
import { workerAiService } from "@/features/ai-tools/services/worker-ai.service";
import type {
  CoverLetterPayload,
  MatchScorePayload,
} from "@/interfaces/worker-ai.interface";

/** Each tool consumes a plan unit on success, so refresh entitlements/usage. */
function useRefreshUsage() {
  const queryClient = useQueryClient();
  return () =>
    queryClient.invalidateQueries({ queryKey: qk.myEntitlements });
}

/** AI CV Builder — generates a CV from the worker's stored profile. */
export function useBuildCv() {
  const refresh = useRefreshUsage();
  return useMutation({
    mutationFn: () => workerAiService.buildCv(),
    onSuccess: refresh,
  });
}

/** AI Cover Letter — tailored to a supplied job. */
export function useGenerateCoverLetter() {
  const refresh = useRefreshUsage();
  return useMutation({
    mutationFn: (payload: CoverLetterPayload) =>
      workerAiService.generateCoverLetter(payload),
    onSuccess: refresh,
  });
}

/** AI Match Score — scores the worker against a supplied job. */
export function useMatchScore() {
  const refresh = useRefreshUsage();
  return useMutation({
    mutationFn: (payload: MatchScorePayload) =>
      workerAiService.getMatchScore(payload),
    onSuccess: refresh,
  });
}
