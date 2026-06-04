"use client";

import { useMutation } from "@tanstack/react-query";

import { chatService } from "@/features/chat/services/chat.service";
import { isApiClientError } from "@/lib/api/error";
import type { ReactionType } from "@/interfaces/enums";

/**
 * Persist a like/dislike (or clear it with `null`) for an assistant message.
 * The action bar owns the optimistic UI; this just writes through to the API.
 *
 * Retries the PUT exactly once after ~700 ms on a 404 to handle the brief race
 * where the user reacts the instant streaming ends but the assistant DB row
 * hasn't committed yet. All other errors surface immediately so the `onError`
 * toast fires without delay.
 */
export function useSetReaction() {
  return useMutation({
    mutationFn: (vars: { messageId: string; reaction: ReactionType | null }) =>
      chatService.setFeedback(vars.messageId, { reaction: vars.reaction }),
    retry: (failureCount: number, error: unknown) =>
      failureCount < 1 && isApiClientError(error) && error.status === 404,
    retryDelay: 700,
  });
}
