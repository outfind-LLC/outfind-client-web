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
 * its thread. `buildHref` controls the destination so each tab lands the new
 * conversation under its own surface (Job Search → `/jobs/<id>`, AI Assistant →
 * `/assistant/<id>`); the queued message auto-sends once the thread mounts.
 */
export function useStartConversation(
  buildHref: (id: string) => string = routes.assistantThread,
) {
  const queryClient = useQueryClient();
  const router = useRouter();
  const queuePending = useComposerStore((s) => s.queuePending);

  return useMutation({
    mutationFn: (vars: { message: string; specialist?: AiSpecialist }) =>
      chatService.createConversation({ specialist: vars.specialist }),
    onSuccess: (conversation, vars) => {
      queuePending(conversation.id, vars.message);
      queryClient.invalidateQueries({ queryKey: qk.conversations() });
      router.push(buildHref(conversation.id));
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

/** Rename a conversation's title and refresh the affected caches. */
export function useRenameConversation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (vars: { id: string; title: string }) =>
      chatService.updateConversation(vars.id, { title: vars.title }),
    onSuccess: (_conversation, vars) => {
      queryClient.invalidateQueries({ queryKey: qk.conversations() });
      queryClient.invalidateQueries({ queryKey: qk.conversation(vars.id) });
    },
  });
}

/** Pin or unpin a conversation (moves it in/out of the Pinned section). */
export function usePinConversation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (vars: { id: string; isPinned: boolean }) =>
      chatService.updateConversation(vars.id, { isPinned: vars.isPinned }),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: qk.conversations() }),
  });
}
