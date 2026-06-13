"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";

import { qk } from "@/config/query-keys";
import { workerAiService } from "@/features/ai-tools/services/worker-ai.service";
import { jobKey, toJobContextPayload } from "@/features/jobs/lib/job-context";
import type { AiToolId } from "@/features/jobs/constants/job-ai-tools";
import type { JobCardData } from "@/features/chat/types/job";
import { isApiClientError } from "@/lib/api/error";
import type {
  CoverLetterResult,
  GeneratedCv,
  InterviewPrepResult,
  JobContextPayload,
  JobInsightsResult,
  MatchScoreResult,
} from "@/interfaces/worker-ai.interface";

/** Discriminated result of any per-job AI tool. */
export type JobAiResult =
  | { tool: "cv"; data: GeneratedCv }
  | { tool: "cover"; data: CoverLetterResult }
  | { tool: "match"; data: MatchScoreResult }
  | { tool: "insights"; data: JobInsightsResult }
  | { tool: "interview"; data: InterviewPrepResult };

async function runTool(
  tool: AiToolId,
  payload: JobContextPayload,
): Promise<JobAiResult> {
  switch (tool) {
    case "cv":
      return { tool, data: await workerAiService.buildCvForJob(payload) };
    case "cover":
      return {
        tool,
        data: await workerAiService.generateCoverLetter({
          jobTitle: payload.jobTitle,
          companyName: payload.companyName,
          jobDescription: payload.jobDescription,
        }),
      };
    case "match":
      return {
        tool,
        data: await workerAiService.getMatchScore({
          jobTitle: payload.jobTitle,
          jobDescription: payload.jobDescription,
          requiredSkills: payload.requiredSkills,
        }),
      };
    case "insights":
      return { tool, data: await workerAiService.getJobInsights(payload) };
    case "interview":
      return { tool, data: await workerAiService.getInterviewPrep(payload) };
  }
}

/**
 * Run (and cache) one per-job AI tool. Backed by a query keyed on job + tool so
 * reopening a tool shows the previous result instantly without re-spending a
 * quota unit; `refetch` regenerates on demand. Plan/access errors (402/403/422)
 * and rate limits are surfaced immediately, never retried.
 */
export function useJobAiTool(
  tool: AiToolId,
  job: JobCardData,
  enabled: boolean,
) {
  const queryClient = useQueryClient();

  return useQuery<JobAiResult, unknown>({
    queryKey: qk.jobAiTool(tool, jobKey(job)),
    queryFn: async () => {
      const result = await runTool(tool, toJobContextPayload(job));
      // A successful generation consumes a plan unit — refresh usage/entitlements.
      void queryClient.invalidateQueries({ queryKey: qk.myEntitlements });
      return result;
    },
    enabled,
    staleTime: Infinity,
    gcTime: 30 * 60 * 1000,
    refetchOnWindowFocus: false,
    retry: (failureCount, error) => {
      if (
        isApiClientError(error) &&
        [402, 403, 422, 429].includes(error.status)
      ) {
        return false;
      }
      return failureCount < 1;
    },
  });
}
