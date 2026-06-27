"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { qk } from "@/config/query-keys";
import { applicationsService } from "@/features/applications/services/applications.service";
import {
  EMPLOYER_MOCKS_ENABLED,
  appendMockMessage,
  isMockApplicationId,
  mockMessages,
} from "@/features/applications/data/employer-mocks";
import type {
  ApplicationMessage,
  ConversationScope,
} from "@/interfaces/application.interface";

/** Poll cadence while a conversation is open — near-real-time without sockets. */
const POLL_MS = 8000;

/** True for the employer mock conversations (see employer-mocks.ts). */
function isMock(scope: ConversationScope, applicationId: string): boolean {
  return EMPLOYER_MOCKS_ENABLED && scope === "employer" && isMockApplicationId(applicationId);
}

/** Messages for one application. Polls only while `enabled` (dialog open). */
export function useApplicationMessages(
  scope: ConversationScope,
  applicationId: string,
  enabled: boolean,
) {
  return useQuery<ApplicationMessage[]>({
    queryKey: qk.applicationMessages(applicationId),
    queryFn: () =>
      isMock(scope, applicationId)
        ? Promise.resolve(mockMessages(applicationId))
        : applicationsService.listMessages(scope, applicationId, { limit: 100 }),
    enabled: Boolean(applicationId) && enabled,
    refetchInterval: enabled && !isMock(scope, applicationId) ? POLL_MS : false,
  });
}

/** Send a message, then refresh the thread + the applications/applicants lists
 * (their `lastMessageAt` changed). */
export function useSendApplicationMessage(
  scope: ConversationScope,
  applicationId: string,
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (content: string) =>
      isMock(scope, applicationId)
        ? Promise.resolve(
            appendMockMessage(applicationId, content, "EMPLOYER", new Date().toISOString()),
          )
        : applicationsService.sendMessage(scope, applicationId, content),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: qk.applicationMessages(applicationId),
      });
      queryClient.invalidateQueries({ queryKey: ["applications"] });
      queryClient.invalidateQueries({ queryKey: ["applicants"] });
    },
  });
}

/** Mark the thread read for the caller's side. */
export function useMarkApplicationRead(
  scope: ConversationScope,
  applicationId: string,
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () =>
      isMock(scope, applicationId)
        ? Promise.resolve(null)
        : applicationsService.markMessagesRead(scope, applicationId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: qk.applicationMessages(applicationId),
      });
      // The inbox unread badge + "Only unread" filter read from the list views,
      // so refresh them too once the thread is marked read.
      queryClient.invalidateQueries({ queryKey: ["applications"] });
      queryClient.invalidateQueries({ queryKey: ["applicants"] });
    },
  });
}
