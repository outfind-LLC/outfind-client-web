import Image from "next/image";
import { isToolUIPart, type UIMessage } from "ai";

import { splitThinking } from "@/features/chat/lib/think";
import { extractJobs, isJobSearchTool } from "@/features/chat/types/job";
import { cn } from "@/lib/utils";
import type { ReactionType } from "@/interfaces/enums";
import { Markdown } from "./markdown";
import { MessageActions } from "./message-actions";
import { ToolPart } from "./tool-part";

interface MessageBubbleProps {
  message: UIMessage;
  /** True only for the assistant turn that is currently streaming. */
  streaming?: boolean;
}

function readReaction(message: UIMessage): ReactionType | null {
  const meta = message.metadata as
    | { reaction?: ReactionType | null }
    | undefined;
  return meta?.reaction ?? null;
}

/** Plain-text answer (tags + thinking stripped) for the copy button. */
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
 * Whether the message has rendered job cards — a job-search tool that resolved
 * to at least one result. When true we show only the cards and drop the model's
 * prose, which otherwise re-lists the same jobs (duplicate). Works the same on a
 * live turn and on reloaded history, so there's never a card + text repeat.
 */
function hasJobCards(message: UIMessage): boolean {
  for (const part of message.parts) {
    if (!isToolUIPart(part)) continue;
    const toolType =
      part.type === "dynamic-tool" ? `tool-${part.toolName}` : part.type;
    if (!isJobSearchTool(toolType)) continue;
    if (
      part.state === "output-available" &&
      extractJobs(toolType, part.output).length > 0
    ) {
      return true;
    }
  }
  return false;
}

/**
 * Whether the message already has something for the reader to see — final answer
 * text or rendered job cards. Reasoning never counts: while the model is only
 * thinking or running a search, the message is still "working" and we show the
 * loader instead of exposing the internal process.
 */
function hasVisibleContent(message: UIMessage): boolean {
  if (hasJobCards(message)) return true;
  for (const part of message.parts) {
    if (part.type === "text" && splitThinking(part.text).answer.length > 0) {
      return true;
    }
    if (isToolUIPart(part) && part.state === "output-error") return true;
  }
  return false;
}

/** Jobsterr logo avatar; pulses while the assistant is generating a reply. */
function AssistantAvatar({ loading }: { loading?: boolean }) {
  return (
    <span
      className={cn(
        "bg-card border-border/60 mt-0.5 flex size-8 shrink-0 items-center justify-center overflow-hidden rounded-lg border",
        loading && "ring-primary/40 animate-pulse ring-2",
      )}
    >
      <Image
        src="/Jobsterr-icon-logo.svg"
        alt="Jobsterr"
        width={20}
        height={20}
        className="size-5"
      />
    </span>
  );
}

/** A subtle three-dot "generating" indicator shown next to the logo. */
function GeneratingDots() {
  return (
    <div
      className="flex items-center gap-1 pt-2"
      role="status"
      aria-label="Generating response"
    >
      <span className="bg-primary/60 size-1.5 animate-bounce rounded-full [animation-delay:-300ms]" />
      <span className="bg-primary/60 size-1.5 animate-bounce rounded-full [animation-delay:-150ms]" />
      <span className="bg-primary/60 size-1.5 animate-bounce rounded-full" />
    </div>
  );
}

/**
 * Placeholder assistant turn shown the instant a message is sent, before any
 * token streams back. Mirrors the streaming bubble so the loader stays anchored
 * to the logo without a visual jump.
 */
export function PendingAssistantBubble() {
  return (
    <div className="flex gap-3">
      <AssistantAvatar loading />
      <div className="min-w-0 flex-1">
        <GeneratingDots />
      </div>
    </div>
  );
}

/** Renders one chat message. User turns are a compact right-aligned bubble;
 * assistant turns walk their parts (text → markdown, job tools → cards) and
 * never surface reasoning — a loader by the logo covers the "thinking" phase. */
export function MessageBubble({ message, streaming }: MessageBubbleProps) {
  if (message.role === "user") {
    const text = message.parts
      .filter((part) => part.type === "text")
      .map((part) => (part.type === "text" ? part.text : ""))
      .join("\n");

    return (
      <div className="flex justify-end">
        <div className="bg-primary text-primary-foreground max-w-[80%] rounded-2xl rounded-br-md px-4 py-2.5 text-sm leading-relaxed break-words whitespace-pre-wrap">
          {text}
        </div>
      </div>
    );
  }

  const copyText = answerText(message);
  const showActions = !streaming && copyText.length > 0;
  const working = Boolean(streaming) && !hasVisibleContent(message);
  // When job cards are shown, drop the model's prose so the same roles aren't
  // listed twice (once as cards, once as text).
  const jobCardsPresent = hasJobCards(message);

  return (
    <div className="group/msg flex gap-3">
      <AssistantAvatar loading={working} />

      <div className="min-w-0 flex-1 space-y-3 pt-1">
        {message.parts.map((part, index) => {
          // Reasoning is intentionally never rendered.
          if (part.type === "text") {
            if (jobCardsPresent) return null;
            const { answer } = splitThinking(part.text);
            return answer ? <Markdown key={index} content={answer} /> : null;
          }
          if (isToolUIPart(part)) {
            return <ToolPart key={index} part={part} />;
          }
          return null;
        })}

        {working ? <GeneratingDots /> : null}

        {showActions ? (
          <MessageActions
            messageId={message.id}
            text={copyText}
            initialReaction={readReaction(message)}
          />
        ) : null}
      </div>
    </div>
  );
}
