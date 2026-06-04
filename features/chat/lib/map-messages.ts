import type { UIMessage } from "ai";

import type { ChatMessage } from "@/interfaces/chat.interface";
import { CONVERSATION_ROLE } from "@/interfaces/enums";

type UIRole = UIMessage["role"];

function toUIRole(role: ChatMessage["role"]): UIRole {
  if (role === CONVERSATION_ROLE.USER) return "user";
  if (role === CONVERSATION_ROLE.SYSTEM) return "system";
  return "assistant";
}

/**
 * Map a stored backend message to an AI SDK `UIMessage`. Prefers the persisted
 * `parts` (assembled tool/text/reasoning parts for exact re-render); falls back
 * to scalar `content` + `reasoning` for older or user messages.
 */
function toUIMessage(message: ChatMessage): UIMessage {
  const role = toUIRole(message.role);
  // Carry the saved reaction so the action bar can show it on reload.
  const metadata = { reaction: message.reaction ?? null };

  if (Array.isArray(message.parts) && message.parts.length > 0) {
    return {
      id: message.id,
      role,
      parts: message.parts as UIMessage["parts"],
      metadata,
    };
  }

  const parts: UIMessage["parts"] = [];
  if (message.reasoning) {
    parts.push({ type: "reasoning", text: message.reasoning, state: "done" });
  }
  if (message.content) {
    parts.push({ type: "text", text: message.content, state: "done" });
  }

  return { id: message.id, role, parts, metadata };
}

/**
 * Convert a page of history (returned newest-first) into oldest-first
 * `UIMessage`s ready to seed `useChat`.
 */
export function toUIMessages(messages: ChatMessage[]): UIMessage[] {
  return [...messages].reverse().map(toUIMessage);
}
