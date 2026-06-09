import { routes } from "@/config/routes";
import { AI_SPECIALIST } from "@/interfaces/enums";
import type { Conversation } from "@/interfaces/chat.interface";

/** The two conversation surfaces in the worker/employer shell. */
export type ChatTab = "jobs" | "assistant";

/**
 * Each conversation lives under its tab: Job Finder chats under Job Search,
 * everything else under the AI Assistant. Centralised so history links, the
 * sidebar, and landing pages all route consistently.
 */
export function conversationHref(
  conversation: Pick<Conversation, "id" | "specialist">,
): string {
  return conversation.specialist === AI_SPECIALIST.JOB_FINDER
    ? routes.jobsThread(conversation.id)
    : routes.assistantThread(conversation.id);
}

/** Which tab a conversation belongs to, by specialist. */
export function tabForConversation(
  conversation: Pick<Conversation, "specialist">,
): ChatTab {
  return conversation.specialist === AI_SPECIALIST.JOB_FINDER
    ? "jobs"
    : "assistant";
}

/** Which tab the current path is in (everything non-Jobs is the Assistant). */
export function tabForPath(pathname: string): ChatTab {
  return pathname.startsWith(routes.jobs) ? "jobs" : "assistant";
}
