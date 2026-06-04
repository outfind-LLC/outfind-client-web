import { Fragment } from "react";
import Image from "next/image";
import { isToolUIPart, type UIMessage } from "ai";

import { splitThinking } from "@/features/chat/lib/think";
import type { ReactionType } from "@/interfaces/enums";
import { Markdown } from "./markdown";
import { MessageActions } from "./message-actions";
import { ReasoningBlock } from "./reasoning-block";
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

/** Renders one chat message, walking its parts in order (reasoning, text,
 * tool/job-card invocations). User turns are a compact right-aligned bubble. */
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

  return (
    <div className="group/msg flex gap-3">
      <span className="bg-card border-border/60 mt-0.5 flex size-8 shrink-0 items-center justify-center overflow-hidden rounded-lg border">
        <Image
          src="/Jobsterr-icon-logo.svg"
          alt="Jobsterr"
          width={20}
          height={20}
          className="size-5"
        />
      </span>

      <div className="min-w-0 flex-1 space-y-3 pt-1">
        {message.parts.map((part, index) => {
          if (part.type === "reasoning") {
            return (
              <ReasoningBlock
                key={index}
                text={part.text}
                streaming={part.state === "streaming"}
              />
            );
          }
          if (part.type === "text") {
            const { thinking, answer, thinkingStreaming, hasThinking } =
              splitThinking(part.text);
            return (
              <Fragment key={index}>
                {hasThinking ? (
                  <ReasoningBlock
                    text={thinking}
                    streaming={part.state === "streaming" && thinkingStreaming}
                  />
                ) : null}
                {answer ? <Markdown content={answer} /> : null}
              </Fragment>
            );
          }
          if (isToolUIPart(part)) {
            return <ToolPart key={index} part={part} />;
          }
          return null;
        })}

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
