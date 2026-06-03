"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

import { qk } from "@/config/query-keys";
import { routes } from "@/config/routes";
import { chatService } from "@/features/chat/services/chat.service";
import { useComposerStore } from "@/features/chat/store/composer.store";
import type {
  Conversation,
  ListConversationsQuery,
} from "@/interfaces/chat.interface";
import type { AiSpecialist } from "@/interfaces/enums";

/** List the caller's conversations (newest first), for history + recents. */
export function useConversations(query: ListConversationsQuery = {}) {
  return useQuery<Conversation[]>({
    queryKey: [...qk.conversations(), query],
    queryFn: () => chatService.listConversations(query),
  });
}

/**
 * Start a new conversation, queue the first message for auto-send, and route to
 * its thread. Used by the new-chat composer so the URL becomes `/chat/<id>`
 * before streaming begins.
 */
export function useStartConversation() {
  const queryClient = useQueryClient();
  const router = useRouter();
  const queuePending = useComposerStore((s) => s.queuePending);

  return useMutation({
    mutationFn: (vars: { message: string; specialist?: AiSpecialist }) =>
      chatService.createConversation({ specialist: vars.specialist }),
    onSuccess: (conversation, vars) => {
      queuePending(conversation.id, vars.message);
      queryClient.invalidateQueries({ queryKey: qk.conversations() });
      router.push(routes.chatThread(conversation.id));
    },
  });
}

/** Delete a conversation and refresh the list. */
export function useDeleteConversation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => chatService.deleteConversation(id),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: qk.conversations() }),
  });
}
