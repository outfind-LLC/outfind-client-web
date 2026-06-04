"use client";

import { useMutation } from "@tanstack/react-query";

import { chatService } from "@/features/chat/services/chat.service";
import type { ReactionType } from "@/interfaces/enums";

/**
 * Persist a like/dislike (or clear it with `null`) for an assistant message.
 * The action bar owns the optimistic UI; this just writes through to the API.
 */
export function useSetReaction() {
  return useMutation({
    mutationFn: (vars: { messageId: string; reaction: ReactionType | null }) =>
      chatService.setFeedback(vars.messageId, { reaction: vars.reaction }),
  });
}
