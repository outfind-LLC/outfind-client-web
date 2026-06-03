import { api } from "@/lib/api/client";
import { buildQuery } from "@/lib/api/query";
import { ApiClientError } from "@/lib/api/error";
import { env } from "@/lib/env";
import type { ApiEnvelope } from "@/interfaces/api.interface";
import type {
  ChatMessage,
  Conversation,
  CreateConversationPayload,
  ListConversationsQuery,
  ListMessagesQuery,
  MessageFeedback,
  SendMessagePayload,
  SetFeedbackPayload,
  UpdateConversationPayload,
} from "@/interfaces/chat.interface";

/**
 * Chat API service.
 *
 * List endpoints return bare arrays (newest first); the next cursor is the last
 * item's `id` when a full page came back. The streaming send is special — it
 * returns the raw `Response` so the caller can consume the Vercel UI-message
 * stream body and read the `X-Conversation-Id` / `X-User-Message-Id` headers.
 */
export const chatService = {
  // ─── Conversations ─────────────────────────────────────────────────────────

  async listConversations(
    query: ListConversationsQuery = {},
  ): Promise<Conversation[]> {
    return api.get<Conversation[]>(`/chat/conversations${buildQuery(query)}`);
  },

  async getConversation(id: string): Promise<Conversation> {
    return api.get<Conversation>(`/chat/conversations/${id}`);
  },

  async createConversation(
    payload: CreateConversationPayload = {},
  ): Promise<Conversation> {
    return api.post<Conversation>("/chat/conversations", payload);
  },

  async updateConversation(
    id: string,
    payload: UpdateConversationPayload,
  ): Promise<Conversation> {
    return api.patch<Conversation>(`/chat/conversations/${id}`, payload);
  },

  async deleteConversation(id: string): Promise<null> {
    return api.delete<null>(`/chat/conversations/${id}`);
  },

  // ─── Messages ──────────────────────────────────────────────────────────────

  async listMessages(
    conversationId: string,
    query: ListMessagesQuery = {},
  ): Promise<ChatMessage[]> {
    return api.get<ChatMessage[]>(
      `/chat/conversations/${conversationId}/messages${buildQuery(query)}`,
    );
  },

  async setFeedback(
    messageId: string,
    payload: SetFeedbackPayload,
  ): Promise<MessageFeedback> {
    return api.put<MessageFeedback>(
      `/chat/messages/${messageId}/feedback`,
      payload,
    );
  },

  // ─── Streaming ─────────────────────────────────────────────────────────────

  /**
   * Send a message and return the raw streaming `Response`. The caller reads the
   * UI-message stream from `response.body` and the new ids from the headers.
   * `idempotencyKey` must be unique per logical send so retries never double-post.
   */
  async streamMessage(
    payload: SendMessagePayload,
    idempotencyKey: string,
    signal?: AbortSignal,
  ): Promise<Response> {
    const response = await fetch(`${env.NEXT_PUBLIC_API_URL}/chat`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        "Idempotency-Key": idempotencyKey,
      },
      body: JSON.stringify(payload),
      signal,
    });

    if (!response.ok) {
      // Stream endpoint surfaces JSON errors with the standard envelope.
      const json = (await response
        .json()
        .catch(() => null)) as ApiEnvelope<unknown> | null;
      throw new ApiClientError(response.status, {
        code: json?.error?.code ?? `HTTP_${response.status}`,
        message:
          json?.error?.message ??
          response.statusText ??
          "Something went wrong. Please try again.",
        fields: json?.error?.fields,
      });
    }

    return response;
  },
};
