import { api } from "@/lib/api/client";
import type {
  CoverLetterPayload,
  CoverLetterResult,
  GeneratedCv,
  MatchScorePayload,
  MatchScoreResult,
} from "@/interfaces/worker-ai.interface";

/**
 * Worker AI tools. Each call is quota-gated server-side and reads the worker's
 * stored profile — the CV builder takes no input; the others take a job.
 */
export const workerAiService = {
  async buildCv(): Promise<GeneratedCv> {
    return api.get<GeneratedCv>("/worker/ai/cv");
  },

  async generateCoverLetter(
    payload: CoverLetterPayload,
  ): Promise<CoverLetterResult> {
    return api.post<CoverLetterResult>("/worker/ai/cover-letter", payload);
  },

  async getMatchScore(payload: MatchScorePayload): Promise<MatchScoreResult> {
    return api.post<MatchScoreResult>("/worker/ai/match-score", payload);
  },
};
