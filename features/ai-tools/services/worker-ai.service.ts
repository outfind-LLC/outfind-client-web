import { api } from "@/lib/api/client";
import type {
  CoverLetterPayload,
  CoverLetterResult,
  GeneratedCv,
  InterviewPrepResult,
  JobContextPayload,
  JobInsightsResult,
  MatchScorePayload,
  MatchScoreResult,
  ParsedWorkerProfile,
} from "@/interfaces/worker-ai.interface";

/**
 * Worker AI tools. Each call is quota-gated server-side and reads the worker's
 * stored profile — the CV builder takes no input; the others take a job.
 */
export const workerAiService = {
  async buildCv(): Promise<GeneratedCv> {
    return api.get<GeneratedCv>("/worker/ai/cv");
  },

  /** CV tailored to a specific job. */
  async buildCvForJob(payload: JobContextPayload): Promise<GeneratedCv> {
    return api.post<GeneratedCv>("/worker/ai/cv/for-job", payload);
  },

  async generateCoverLetter(
    payload: CoverLetterPayload,
  ): Promise<CoverLetterResult> {
    return api.post<CoverLetterResult>("/worker/ai/cover-letter", payload);
  },

  async getMatchScore(payload: MatchScorePayload): Promise<MatchScoreResult> {
    return api.post<MatchScoreResult>("/worker/ai/match-score", payload);
  },

  async getJobInsights(payload: JobContextPayload): Promise<JobInsightsResult> {
    return api.post<JobInsightsResult>("/worker/ai/job-insights", payload);
  },

  async getInterviewPrep(
    payload: JobContextPayload,
  ): Promise<InterviewPrepResult> {
    return api.post<InterviewPrepResult>("/worker/ai/interview-prep", payload);
  },

  /**
   * Map a spoken/typed self-description to profile fields for form autofill.
   * Persists nothing — the worker reviews/edits, then saves via the profile
   * endpoints. Only stated fields are populated (rest null).
   */
  async parseProfile(text: string): Promise<ParsedWorkerProfile> {
    return api.post<ParsedWorkerProfile>("/worker/ai/parse-profile", { text });
  },
};
