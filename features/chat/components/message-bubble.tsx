"use client";

import { isToolUIPart, type UIMessage } from "ai";

import { splitThinking } from "@/features/chat/lib/think";
import {
  extractCandidates,
  isCandidateSearchTool,
} from "@/features/chat/types/candidate";
import { extractJobs, isJobSearchTool } from "@/features/chat/types/job";
import { ChatMark } from "@/features/dashboard/components/app-icons";
import { useT } from "@/providers/i18n-provider";
import { cn } from "@/lib/utils";
import type { ReactionType } from "@/interfaces/enums";
import { Markdown } from "./markdown";
import { MessageActions } from "./message-actions";
import { ToolPart } from "./tool-part";
import s from "@/features/dashboard/styles/peoplor-app.module.css";

/** Which surface a thread belongs to (kept for call-site compatibility). */
export type ChatSurface = "jobs" | "assistant";

interface MessageBubbleProps {
  message: UIMessage;
  /** True only for the assistant turn that is currently streaming. */
  streaming?: boolean;
  surface?: ChatSurface;
}

/** Plain-text answer (tags + thinking stripped). */
function answerText(message: UIMessage): string {
  return message.parts
    .filter((part) => part.type === "text")
    .map((part) =>
      part.type === "text" ? splitThinking(part.text).answer : "",
    )
    .join("\n\n")
    .trim();
}

/**
 * Whether the message has rendered result cards — a job- or candidate-search
 * tool that resolved to at least one result. When true we show only the cards
 * and drop the model's prose, which otherwise re-lists the same results.
 */
function hasResultCards(message: UIMessage): boolean {
  for (const part of message.parts) {
    if (!isToolUIPart(part)) continue;
    const toolType =
      part.type === "dynamic-tool" ? `tool-${part.toolName}` : part.type;
    if (
      isJobSearchTool(toolType) &&
      part.state === "output-available" &&
      extractJobs(toolType, part.output).length > 0
    ) {
      return true;
    }
    if (
      isCandidateSearchTool(toolType) &&
      part.state === "output-available" &&
      extractCandidates(toolType, part.output).length > 0
    ) {
      return true;
    }
  }
  return false;
}

/** The caller's saved reaction, carried in metadata on REST-loaded messages. */
function initialReaction(message: UIMessage): ReactionType | null {
  const meta = message.metadata as
    | { reaction?: ReactionType | null }
    | undefined;
  return meta?.reaction ?? null;
}

/** Final answer text or rendered cards — reasoning never counts as visible. */
function hasVisibleContent(message: UIMessage): boolean {
  if (hasResultCards(message)) return true;
  for (const part of message.parts) {
    if (part.type === "text" && splitThinking(part.text).answer.length > 0) {
      return true;
    }
    if (isToolUIPart(part) && part.state === "output-error") return true;
  }
  return false;
}

/** Animated Peoplor brand mark beside an assistant turn (the prototype's
 * "lego" mark: pulses while thinking, settles once the reply is done). */
function ResponseMark({ done }: { done: boolean }) {
  return (
    <span className={cn(s["resp-av"], done && s.done)} aria-hidden="true">
      <ChatMark />
    </span>
  );
}

/** Three-dot typing indicator shown while the assistant is working. */
function Typing() {
  const t = useT();
  return (
    <span className={s.typing} role="status" aria-label={t("chat.working")}>
      <span />
      <span />
      <span />
    </span>
  );
}

/**
 * Placeholder assistant turn shown the instant a message is sent, before any
 * token streams back.
 */
export function PendingAssistantBubble() {
  return (
    <div className={s.row}>
      <ResponseMark done={false} />
      <div className={s.msg}>
        <div className={cn(s.bubble, s.assistant)}>
          <Typing />
        </div>
      </div>
    </div>
  );
}

/**
 * Renders one chat message. User turns are a right-aligned light-green pill;
 * assistant turns are plain text beside the animated brand mark, walking their
 * parts (text → markdown, job tools → card stack) and never surfacing reasoning.
 */
export function MessageBubble({ message, streaming }: MessageBubbleProps) {
  if (message.role === "user") {
    const text = message.parts
      .filter((part) => part.type === "text")
      .map((part) => (part.type === "text" ? part.text : ""))
      .join("\n");

    return (
      <div className={cn(s.row, s.user)}>
        <div className={s.msg}>
          <div className={cn(s.bubble, s.user)}>{text}</div>
        </div>
      </div>
    );
  }

  const working = Boolean(streaming) && !hasVisibleContent(message);
  const cardsPresent = hasResultCards(message);
  const answer = answerText(message);

  return (
    <div className={s.row}>
      <ResponseMark done={!streaming} />
      <div className={s.msg}>
        {cardsPresent ? (
          message.parts.map((part, index) =>
            isToolUIPart(part) ? <ToolPart key={index} part={part} /> : null,
          )
        ) : answer ? (
          <div className={cn(s.bubble, s.assistant)}>
            <Markdown content={answer} />
          </div>
        ) : null}

        {working ? (
          <div className={cn(s.bubble, s.assistant)}>
            <Typing />
          </div>
        ) : null}

        {!streaming && (answer || cardsPresent) ? (
          <MessageActions
            messageId={message.id}
            text={answer}
            initialReaction={initialReaction(message)}
          />
        ) : null}
      </div>
    </div>
  );
}
