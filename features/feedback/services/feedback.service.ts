import { api } from "@/lib/api/client";
import type {
  Feedback,
  SubmitFeedbackPayload,
} from "@/features/feedback/types";

/** Worker platform-feedback API service. */
export const feedbackService = {
  /** The caller's most recent submission (null if they've never sent any). */
  async mine(): Promise<Feedback | null> {
    return api.get<Feedback | null>("/worker/feedback/mine");
  },

  /** Submit a rating / comment / feature suggestion. */
  async submit(payload: SubmitFeedbackPayload): Promise<Feedback> {
    return api.post<Feedback>("/worker/feedback", payload);
  },
};
