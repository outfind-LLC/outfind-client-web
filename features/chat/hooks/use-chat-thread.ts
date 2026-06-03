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
  model?: string;
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
 * specialist?, model? }` contract and stamps a fresh `Idempotency-Key` per send.
 * Specialist/model are read through refs so the transport never rebuilds.
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
          const { specialist, model } = useComposerStore.getState();
          const body: SendBody = {
            conversationId,
            message: lastUserText(messages),
          };
          if (specialist) body.specialist = specialist;
          if (model) body.model = model;
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
  });
}
