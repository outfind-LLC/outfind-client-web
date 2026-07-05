"use client";

import { useMemo } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";

import { env } from "@/lib/env";
import { fetchWithAuthRetry } from "@/lib/api/client";
import { useComposerStore } from "@/features/chat/store/composer.store";
import { readStoredLocale } from "@/lib/i18n/store";

interface SendBody {
  conversationId: string;
  message: string;
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
 * that rewrites the request to the backend's `{ conversationId, message }`
 * contract and stamps a fresh `Idempotency-Key` per send. The specialist is
 * fixed at conversation creation and resolved server-side from the thread —
 * never re-sent per turn — and the AI model is likewise chosen server-side
 * (by use case × plan tier).
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
        // The 15-min access cookie can lapse mid-session with no navigation to
        // refresh it — without this, the next send just 401s and the user looks
        // logged out. Shares apiFetch's single-flight refresh, retries once.
        fetch: fetchWithAuthRetry,
        prepareSendMessagesRequest: ({ messages }) => {
          const body: SendBody = {
            conversationId,
            message: lastUserText(messages),
          };
          // The Job Finder is structured: replay this conversation's profession
          // and city so the backend can run (and re-run) the search on each turn.
          const search = useComposerStore.getState().jobSearch[conversationId];
          if (search) {
            body.profession = search.profession;
            body.city = search.city;
          }
          return {
            body,
            headers: {
              "Idempotency-Key": crypto.randomUUID(),
              // Reply in the user's UI language (browser-detected by default).
              "X-App-Language": readStoredLocale(),
            },
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
