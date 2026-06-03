/**
 * Chat domain contracts — mirror of the backend chat module's `ConversationView`,
 * `MessageView`, and `FeedbackView` projections. All `Date` fields arrive as ISO
 * strings over JSON, so they are typed `string` here.
 */
import type {
  AiAudience,
  AiSpecialist,
  ConversationIntent,
  ConversationRole,
  ReactionType,
} from "./enums";

/** Conversation list/detail projection returned to clients. */
export interface Conversation {
  id: string;
  audience: AiAudience;
  specialist: AiSpecialist;
  title: string | null;
  subtitle: string | null;
  intent: ConversationIntent;
  isPinned: boolean;
  isActive: boolean;
  messageCount: number;
  createdAt: string;
  updatedAt: string;
  lastMessageAt: string | null;
}

/**
 * A single UI message part as assembled by the backend (Vercel AI SDK shape).
 * Kept permissive — exact part schemas vary by type (text, reasoning, tool calls).
 */
export interface MessagePart {
  type: string;
  text?: string;
  [key: string]: unknown;
}

/** Single message projection. Token fields are null on user messages. */
export interface ChatMessage {
  id: string;
  conversationId: string;
  role: ConversationRole;
  specialist: AiSpecialist | null;
  content: string;
  reasoning: string | null;
  /** Full assembled UI parts for exact re-render; null on user messages. */
  parts: MessagePart[] | null;
  model: string | null;
  aiModelId: string | null;
  promptTokens: number | null;
  completionTokens: number | null;
  totalTokens: number | null;
  latencyMs: number | null;
  finishReason: string | null;
  reaction: ReactionType | null;
  createdAt: string;
}

/** A message reaction owned by the caller. */
export interface MessageFeedback {
  messageId: string;
  reaction: ReactionType | null;
  createdAt: string;
  updatedAt: string;
}

// ─── Request payloads ────────────────────────────────────────────────────────

/** Body for `POST /chat` (the streaming send). */
export interface SendMessagePayload {
  conversationId?: string;
  message: string;
  specialist?: AiSpecialist;
  model?: string;
}

/** Body for `POST /chat/conversations`. */
export interface CreateConversationPayload {
  specialist?: AiSpecialist;
  title?: string;
}

/** Body for `PATCH /chat/conversations/:id`. */
export interface UpdateConversationPayload {
  title?: string;
  isPinned?: boolean;
  specialist?: AiSpecialist;
}

/** Query for `GET /chat/conversations`. */
export interface ListConversationsQuery {
  limit?: number;
  cursor?: string;
  q?: string;
  pinned?: boolean;
}

/** Query for `GET /chat/conversations/:id/messages`. */
export interface ListMessagesQuery {
  limit?: number;
  cursor?: string;
}

/** Body for `PUT /chat/messages/:messageId/feedback`. `null` clears the reaction. */
export interface SetFeedbackPayload {
  reaction: ReactionType | null;
}

/** Headers the stream endpoint returns alongside the SSE body. */
export const CHAT_STREAM_HEADERS = {
  conversationId: "x-conversation-id",
  userMessageId: "x-user-message-id",
} as const;
