import { isToolUIPart, type UIMessage } from "ai";

import { Markdown } from "./markdown";
import { ReasoningBlock } from "./reasoning-block";
import { ToolPart } from "./tool-part";

/** Renders one chat message, walking its parts in order (reasoning, text,
 * tool/job-card invocations). User turns are a compact right-aligned bubble. */
export function MessageBubble({ message }: { message: UIMessage }) {
  if (message.role === "user") {
    const text = message.parts
      .filter((part) => part.type === "text")
      .map((part) => (part.type === "text" ? part.text : ""))
      .join("\n");

    return (
      <div className="flex justify-end">
        <div className="bg-primary text-primary-foreground max-w-[80%] rounded-2xl rounded-br-md px-4 py-2.5 text-sm leading-relaxed whitespace-pre-wrap">
          {text}
        </div>
      </div>
    );
  }

  return (
    <div className="flex gap-3">
      <span className="from-brand to-brand-2 mt-1 flex size-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br text-xs font-bold text-white">
        AI
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
            return <Markdown key={index} content={part.text} />;
          }
          if (isToolUIPart(part)) {
            return <ToolPart key={index} part={part} />;
          }
          return null;
        })}
      </div>
    </div>
  );
}
