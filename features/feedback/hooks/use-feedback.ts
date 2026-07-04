"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { qk } from "@/config/query-keys";
import { feedbackService } from "@/features/feedback/services/feedback.service";
import type {
  Feedback,
  SubmitFeedbackPayload,
} from "@/features/feedback/types";

/** The caller's most recent feedback submission (prefills a prior rating). */
export function useMyFeedback() {
  return useQuery<Feedback | null>({
    queryKey: qk.myFeedback,
    queryFn: () => feedbackService.mine(),
  });
}

/** Submit a rating / comment / feature suggestion. */
export function useSubmitFeedback() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: SubmitFeedbackPayload) =>
      feedbackService.submit(payload),
    onSuccess: (feedback) => {
      queryClient.setQueryData(qk.myFeedback, feedback);
    },
  });
}
