"use client";

import { useMemo } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";

import { env } from "@/lib/env";
import { useComposerStore } from "@/features/chat/store/composer.store";
import type { AiSpecialist } from "@/interfaces/enums";

interface SendBody {
  conversationId: string;
  message: string;
  specialist?: AiSpecialist;
  /** AI Job Search structured inputs (required by the Job Finder specialist). */
  profession?: string;
  city?: string;
}

/** Flatten the latest user turn's text parts — the backend wants just the new
 * message string, not the whole transcript (it rebuilds context server-side). */
function lastUserText(messages: UIMessage[]): string {
  for (let i = messages.length - 1; i >= 0; i -= 1) {
    const message = messages[i];
    if (message.role !== "user") continue;
    return message.parts
      .filter(
        (part): part is { type: "text"; text: string } => part.type === "text",
      )
      .map((part) => part.text)
      .join("\n")
      .trim();
  }
  return "";
}

/**
 * Streaming chat for a single conversation. Wraps `useChat` with a transport
 * that rewrites the request to the backend's `{ conversationId, message,
 * specialist? }` contract and stamps a fresh `Idempotency-Key` per send. The AI
 * model is chosen server-side (by use case × plan tier), never sent by the client.
 */
export function useChatThread(
  conversationId: string,
  initialMessages: UIMessage[],
) {
  const transport = useMemo(
    () =>
      new DefaultChatTransport<UIMessage>({
        api: `${env.NEXT_PUBLIC_API_URL}/chat`,
        credentials: "include",
        prepareSendMessagesRequest: ({ messages }) => {
          // Read the latest selection at send time (outside React render).
          const { specialist, jobSearch } = useComposerStore.getState();
          const body: SendBody = {
            conversationId,
            message: lastUserText(messages),
          };
          if (specialist) body.specialist = specialist;
          // The Job Finder is structured: replay this conversation's profession
          // and city so the backend can run (and re-run) the search on each turn.
          const search = jobSearch[conversationId];
          if (search) {
            body.profession = search.profession;
            body.city = search.city;
          }
          return {
            body,
            headers: { "Idempotency-Key": crypto.randomUUID() },
          };
        },
      }),
    [conversationId],
  );

  return useChat({
    id: conversationId,
    transport,
    messages: initialMessages,
    // Batch token updates so the transcript paints smoothly instead of thrashing.
    experimental_throttle: 50,
  });
}
